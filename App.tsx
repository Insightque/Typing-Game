import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import {
  DifficultyLevel,
  GameStatus,
  Language,
  Word,
  GameStats,
  HpLossIndicator,
} from './types';
import {
  DIFFICULTY_CONFIG,
  GAME_AREA_WIDTH,
  GAME_AREA_HEIGHT,
  SANRIO_CHARACTERS,
  ITEM_IMAGES,
  WORD_GENERATION_BATCH_SIZE,
  INITIAL_HP,
} from './constants';
import { getWordsFromLocal, resetUsedWords } from './services/wordService';
import { soundService } from './services/soundService';
import GameArea from './components/GameArea';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.EASY);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const selectedCharacter = SANRIO_CHARACTERS[0];

  const [fallingWords, setFallingWords] = useState<Word[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [level, setLevel] = useState<number>(1);
  const [wordsQueue, setWordsQueue] = useState<string[]>([]);
  const [loadingWords, setLoadingWords] = useState<boolean>(false);
  const [hpLossIndicators, setHpLossIndicators] = useState<HpLossIndicator[]>([]);

  const [gameStats, setGameStats] = useState<GameStats>({
    wordsTyped: 0,
    correctWords: 0,
    incorrectWords: 0,
    typingSpeedWPM: 0,
    accuracy: 0,
    startTime: null,
    totalTypedCharacters: 0,
    currentHp: INITIAL_HP,
  });

  const animationFrameId = useRef<number | null>(null);
  const lastSpawnTime = useRef<number>(0);
  const wordSpeedRef = useRef<number>(DIFFICULTY_CONFIG[difficulty].initialSpeed);
  const wordIntervalRef = useRef<number>(DIFFICULTY_CONFIG[difficulty].initialWordInterval);

  const updateStats = useCallback((typedWord: string, isCorrect: boolean) => {
    setGameStats((prevStats) => {
      const newWordsTyped = prevStats.wordsTyped + 1;
      const newCorrectWords = prevStats.correctWords + (isCorrect ? 1 : 0);
      const newIncorrectWords = prevStats.incorrectWords + (isCorrect ? 0 : 1);
      const newTotalTypedCharacters = prevStats.totalTypedCharacters + typedWord.length;
      const accuracy = newWordsTyped > 0 ? (newCorrectWords / newWordsTyped) * 100 : 0;
      let typingSpeedWPM = 0;
      if (prevStats.startTime !== null) {
        const elapsedTimeMinutes = (Date.now() - prevStats.startTime) / 60000;
        if (elapsedTimeMinutes > 0) typingSpeedWPM = (newTotalTypedCharacters / 5) / elapsedTimeMinutes;
      }
      return { ...prevStats, wordsTyped: newWordsTyped, correctWords: newCorrectWords, incorrectWords: newIncorrectWords, typingSpeedWPM, accuracy, totalTypedCharacters: newTotalTypedCharacters };
    });
  }, []);

  const fetchWords = useCallback(async () => {
    if (loadingWords) return;
    setLoadingWords(true);
    try {
      // 배치 사이즈를 10으로 줄여 큐 관리를 더 촘촘하게 함
      const newWords = await getWordsFromLocal(language, difficulty, 10);
      setWordsQueue((prev) => [...prev, ...newWords]);
    } catch (error) {
      console.error('Failed to fetch words:', error);
    } finally {
      setLoadingWords(false);
    }
  }, [loadingWords, difficulty, language]);

  // 큐 보충 조건 최적화
  useEffect(() => {
    if (gameStatus === GameStatus.PLAYING && wordsQueue.length < 5 && !loadingWords) {
      fetchWords();
    }
  }, [gameStatus, wordsQueue.length, loadingWords, fetchWords]);

  const endGame = useCallback(() => {
    setGameStatus(GameStatus.GAME_OVER);
    soundService.playGameOver();
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
  }, []);

  useEffect(() => {
    if (gameStatus === GameStatus.PLAYING && gameStats.currentHp <= 0) {
      endGame();
    }
  }, [gameStats.currentHp, gameStatus, endGame]);

  const gameLoop = useCallback(() => {
    if (gameStatus !== GameStatus.PLAYING) return;
    const now = Date.now();

    setFallingWords((prevWords) => {
      const wordsAtBottom: Word[] = [];
      const stillFalling: Word[] = [];

      prevWords.forEach(word => {
        const nextTop = word.top + wordSpeedRef.current;
        if (nextTop > GAME_AREA_HEIGHT) {
          wordsAtBottom.push(word);
        } else {
          stillFalling.push({ ...word, top: nextTop });
        }
      });

      if (wordsAtBottom.length > 0) {
        wordsAtBottom.forEach(() => {
          soundService.playHpLoss();
        });

        setGameStats(prev => ({
          ...prev,
          currentHp: Math.max(0, prev.currentHp - wordsAtBottom.length),
          wordsTyped: prev.wordsTyped + wordsAtBottom.length,
          incorrectWords: prev.incorrectWords + wordsAtBottom.length,
        }));

        setHpLossIndicators(prev => [
          ...prev,
          ...wordsAtBottom.map(w => ({
            id: uuidv4(),
            top: GAME_AREA_HEIGHT - 20,
            left: w.left,
            timestamp: Date.now()
          }))
        ]);
      }

      if (now - lastSpawnTime.current > wordIntervalRef.current && 
          stillFalling.length < DIFFICULTY_CONFIG[difficulty].maxWordsOnScreen) {
        
        if (wordsQueue.length > 0) {
          lastSpawnTime.current = now;
          const nextWordText = wordsQueue[0];
          
          if (nextWordText) {
            const safeMargin = 120;
            const newWord: Word = {
              id: uuidv4(),
              text: nextWordText,
              top: -50,
              left: Math.random() * (GAME_AREA_WIDTH - (safeMargin * 2)) + safeMargin,
              speed: wordSpeedRef.current,
              itemImageUrl: ITEM_IMAGES[Math.floor(Math.random() * ITEM_IMAGES.length)],
            };
            stillFalling.push(newWord);
            setWordsQueue(prev => prev.slice(1));
          }
        }
      }
      return stillFalling;
    });

    setHpLossIndicators(prev => prev.filter(indicator => (now - indicator.timestamp) < 1500));
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [gameStatus, wordsQueue, difficulty, endGame]);

  const startGame = useCallback(() => {
    setGameStatus(GameStatus.PLAYING);
    setLevel(1);
    setFallingWords([]);
    setCurrentInput('');
    setHpLossIndicators([]);
    setGameStats({ wordsTyped: 0, correctWords: 0, incorrectWords: 0, typingSpeedWPM: 0, accuracy: 0, startTime: Date.now(), totalTypedCharacters: 0, currentHp: INITIAL_HP });
    wordSpeedRef.current = DIFFICULTY_CONFIG[difficulty].initialSpeed;
    wordIntervalRef.current = DIFFICULTY_CONFIG[difficulty].initialWordInterval;
    lastSpawnTime.current = Date.now();
    setWordsQueue([]);
    resetUsedWords(language, difficulty);
    fetchWords();
  }, [difficulty, language, fetchWords]);

  useEffect(() => {
    if (gameStatus === GameStatus.PLAYING) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }
    return () => { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); };
  }, [gameStatus, gameLoop]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (gameStatus !== GameStatus.PLAYING) return;
    const input = event.target.value;
    setCurrentInput(input);
    const typedWord = fallingWords.find((word) => word.text === input);
    if (typedWord) {
      soundService.playCorrect();
      setFallingWords((prevWords) => prevWords.filter((word) => word.id !== typedWord.id));
      setCurrentInput('');
      updateStats(typedWord.text, true);
      if ((gameStats.correctWords + 1) % 5 === 0) {
        setLevel(prev => prev + 1);
        wordSpeedRef.current += DIFFICULTY_CONFIG[difficulty].speedIncrement;
      }
    }
  }, [fallingWords, gameStatus, updateStats, gameStats.correctWords, difficulty]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden p-1 sm:p-4">
      
      {gameStatus === GameStatus.PLAYING && (
        <div className="w-full max-w-lg mb-2 flex flex-col items-center space-y-1">
          <div className="text-[10px] font-bold text-pink-300 tracking-widest uppercase">Sophia Jiyu Typing Game</div>
          <div className="w-full flex justify-between items-center px-4 py-2 bg-white bg-opacity-80 rounded-full border-4 border-white shadow-md">
            <div className="flex space-x-1">
              {Array.from({ length: INITIAL_HP }).map((_, i) => (
                <span key={i} className="text-xl transition-all duration-300 transform">
                  {i < gameStats.currentHp ? '💖' : '🤍'}
                </span>
              ))}
            </div>
            <div className="font-black text-pink-500 text-xl">LV.{level} | {gameStats.correctWords}</div>
          </div>
        </div>
      )}

      <GameArea
        fallingWords={fallingWords}
        selectedCharacter={selectedCharacter}
        currentInput={currentInput}
        hpLossIndicators={hpLossIndicators}
      />

      <div className="mt-2 text-[10px] sm:text-[12px] font-bold text-white text-opacity-80 drop-shadow-sm tracking-widest uppercase">
        Designed for Sophia Jiyu
      </div>

      {gameStatus === GameStatus.IDLE && (
        <div className="absolute inset-0 z-50 bg-white bg-opacity-90 flex flex-col items-center justify-center p-8 backdrop-blur-sm">
          <div className="text-pink-300 text-lg font-bold tracking-[0.3em] mb-[-5px]">SOPHIA JIYU'S</div>
          <h1 className="text-5xl sm:text-7xl font-black text-pink-500 mb-8 animate-bounce text-center">Fairy Typing 🎀</h1>
          <div className="w-full max-w-xs space-y-4 mb-10">
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)} className="w-full p-4 bg-pink-50 border-4 border-white text-pink-600 font-bold rounded-2xl shadow-sm focus:outline-none">
              {Object.values(DifficultyLevel).map(v => <option key={v} value={v}>{v} Mode</option>)}
            </select>
            <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="w-full p-4 bg-blue-50 border-4 border-white text-blue-600 font-bold rounded-2xl shadow-sm focus:outline-none">
              <option value={Language.ENGLISH}>English 🇺🇸</option>
              <option value={Language.KOREAN}>한국어 🇰🇷</option>
            </select>
          </div>
          <button onClick={startGame} className="px-16 py-6 bg-pink-400 text-white font-black text-3xl rounded-[3rem] shadow-[0_12px_0_#f472b6] hover:bg-pink-300 transition-all hover:scale-110 active:translate-y-2 active:shadow-none">START ✨</button>
        </div>
      )}

      {gameStatus === GameStatus.GAME_OVER && (
        <div className="absolute inset-0 z-50 bg-white bg-opacity-95 flex flex-col items-center justify-center p-8 backdrop-blur-md">
          <div className="text-pink-300 text-sm font-bold tracking-widest mb-2">SOPHIA JIYU MAGIC RESULT</div>
          <h2 className="text-6xl font-black text-pink-500 mb-4">Result 🌷</h2>
          <div className="w-full max-w-sm grid grid-cols-2 gap-4 mb-10">
            <div className="bg-pink-50 p-6 rounded-3xl text-center border-4 border-white shadow-sm">
              <div className="text-pink-300 text-sm font-bold">WPM</div>
              <div className="text-4xl font-black text-pink-600">{Math.round(gameStats.typingSpeedWPM)}</div>
            </div>
            <div className="bg-blue-50 p-6 rounded-3xl text-center border-4 border-white shadow-sm">
              <div className="text-blue-300 text-sm font-bold">Accuracy</div>
              <div className="text-4xl font-black text-blue-600">{Math.round(gameStats.accuracy)}%</div>
            </div>
            <div className="col-span-2 bg-yellow-50 p-6 rounded-3xl text-center border-4 border-white shadow-sm flex justify-around items-center">
              <div>
                <div className="text-yellow-600 text-sm font-bold">Correct</div>
                <div className="text-2xl font-black">{gameStats.correctWords}</div>
              </div>
              <div className="w-px h-10 bg-yellow-200"></div>
              <div>
                <div className="text-yellow-600 text-sm font-bold">Level</div>
                <div className="text-2xl font-black">{level}</div>
              </div>
            </div>
          </div>
          <button onClick={() => setGameStatus(GameStatus.IDLE)} className="px-12 py-5 bg-pink-400 text-white font-black text-2xl rounded-3xl shadow-[0_10px_0_#f472b6] hover:bg-pink-300 transition-all active:translate-y-2 active:shadow-none">REPLAY 🎀</button>
        </div>
      )}

      {gameStatus === GameStatus.PLAYING && (
        <div className="fixed bottom-4 sm:bottom-10 w-full max-w-md px-4">
          <input
            type="text"
            value={currentInput}
            onChange={handleInputChange}
            className="w-full py-3 sm:py-4 px-6 sm:px-8 bg-white border-4 sm:border-8 border-pink-100 text-pink-500 rounded-[3rem] shadow-2xl text-center text-2xl sm:text-3xl font-black focus:outline-none focus:ring-8 focus:ring-pink-50 transition-all placeholder-pink-100"
            placeholder="Type magic!"
            autoFocus
          />
        </div>
      )}
    </div>
  );
};

export default App;