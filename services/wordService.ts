import { DifficultyLevel, Language } from '../types';

interface WordData {
  english: {
    [key in DifficultyLevel]: string[];
  };
  korean: {
    [key in DifficultyLevel]: string[];
  };
}

let loadedWords: WordData | null = null;
// 각 세션별로 사용할 단어 큐를 보관
let shuffledQueues: { [key: string]: string[] } = {};

async function loadWords(): Promise<WordData> {
  if (loadedWords) return loadedWords;
  try {
    const response = await fetch('./words.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    loadedWords = await response.json();
    return loadedWords!;
  } catch (error) {
    console.error("Failed to load words from words.json:", error);
    // 폴백 단어 리스트
    return {
      english: { 
        EASY: ["apple", "sun", "cat", "dog", "cup", "star", "moon", "tree"], 
        MEDIUM: ["adventure", "rainbow", "journey", "mystery", "solution"], 
        HARD: ["cacophony", "ephemeral", "obfuscate", "paradox", "ubiquitous"] 
      },
      korean: { 
        EASY: ["사과", "하늘", "고양이", "강아지", "별님", "달님", "나무", "구름"], 
        MEDIUM: ["무지개", "도전하다", "여행자", "신비로운", "해결책"], 
        HARD: ["불가사의", "형이상학", "불가지론", "인식론", "변증법"] 
      }
    };
  }
}

// 피셔-예이츠 셔플 알고리즘
function shuffleArray(array: string[]): string[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function resetUsedWords(language: Language, difficulty: DifficultyLevel) {
  const key = `${language}_${difficulty}`;
  delete shuffledQueues[key];
}

export async function getWordsFromLocal(
  language: Language,
  difficulty: DifficultyLevel,
  count: number,
): Promise<string[]> {
  const wordsData = await loadWords();
  const langKey = language === Language.ENGLISH ? 'english' : 'korean';
  const sessionKey = `${language}_${difficulty}`;
  
  // 해당 세션의 큐가 없거나 비어있으면 새로 생성
  if (!shuffledQueues[sessionKey] || shuffledQueues[sessionKey].length === 0) {
    const allWords = wordsData[langKey][difficulty] || [];
    shuffledQueues[sessionKey] = shuffleArray(allWords);
    
    // 만약 전체 단어 수가 요청 수보다도 적은 극단적인 경우를 대비
    if (shuffledQueues[sessionKey].length === 0) {
      return ["magic", "fairy", "love"]; 
    }
  }

  const result: string[] = [];
  
  // 요청한 개수만큼 큐에서 꺼냄
  for (let i = 0; i < count; i++) {
    // 꺼내다가 큐가 비면 다시 셔플해서 채움 (중복 방지를 위해 기존 목록과 섞이지 않게 함)
    if (shuffledQueues[sessionKey].length === 0) {
      const allWords = wordsData[langKey][difficulty] || [];
      shuffledQueues[sessionKey] = shuffleArray(allWords);
    }
    
    const word = shuffledQueues[sessionKey].pop();
    if (word) result.push(word);
  }
  
  return result;
}