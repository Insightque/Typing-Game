import React from 'react';
import { GameStats } from '../types';
import { INITIAL_HP } from '../constants';

interface ScoreDisplayProps {
  stats: GameStats;
  level: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ stats, level }) => {
  const { wordsTyped, correctWords, incorrectWords, typingSpeedWPM, accuracy, currentHp } = stats;

  const hearts = Array.from({ length: INITIAL_HP }).map((_, index) => (
    <span
      key={index}
      className={`text-2xl transition-all duration-300 ${index < currentHp ? 'scale-110 drop-shadow-sm' : 'grayscale opacity-30 scale-90'}`}
      role="img"
      aria-label="heart"
    >
      {index < currentHp ? '💖' : '🤍'}
    </span>
  ));

  return (
    <div className="p-5 bg-white bg-opacity-80 rounded-[2rem] shadow-lg border-4 border-pink-100">
      <h3 className="text-2xl font-bold text-pink-500 mb-4 text-center">Fairy Stats</h3>
      <div className="grid grid-cols-2 gap-3 text-sm text-pink-900">
        <div className="col-span-2 p-3 bg-blue-50 bg-opacity-80 rounded-2xl flex justify-between items-center border border-blue-100">
          <span className="font-bold text-blue-500">Magic Level:</span>
          <span className="text-xl font-black text-blue-600">{level}</span>
        </div>
        <div className="col-span-2 p-3 bg-pink-50 bg-opacity-80 rounded-2xl flex flex-col items-center border border-pink-100">
          <span className="font-bold text-pink-400 mb-1">Health</span>
          <div className="flex space-x-1">
            {hearts}
          </div>
        </div>
        <div className="p-3 bg-yellow-50 bg-opacity-80 rounded-2xl flex flex-col items-center border border-yellow-100">
          <span className="font-bold text-yellow-600">Typed</span>
          <span className="text-lg font-black">{wordsTyped}</span>
        </div>
        <div className="p-3 bg-green-50 bg-opacity-80 rounded-2xl flex flex-col items-center border border-green-100">
          <span className="font-bold text-green-600">Speed</span>
          <span className="text-lg font-black">{Math.round(typingSpeedWPM)}</span>
        </div>
        <div className="col-span-2 p-3 bg-white bg-opacity-90 rounded-2xl flex justify-between items-center border border-pink-200">
          <span className="font-bold text-pink-400">Accuracy:</span>
          <span className="text-lg font-black text-pink-600">{accuracy.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay;