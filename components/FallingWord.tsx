import React from 'react';
import { Word } from '../types';

interface FallingWordProps {
  word: Word;
}

const FallingWord: React.FC<FallingWordProps> = ({ word }) => {
  return (
    <div
      key={word.id}
      className="absolute flex flex-col items-center select-none"
      style={{
        top: `${word.top}px`,
        left: `${word.left}px`,
        transform: 'translateX(-50%)',
        zIndex: 10,
      }}
    >
      <img 
        src={word.itemImageUrl} 
        alt="item" 
        className="w-12 h-12 mb-1 drop-shadow-md animate-bounce" 
        style={{ animationDuration: '2s' }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://img.icons8.com/fluency/48/star.png';
        }}
      />
      <span className="text-xl font-bold text-pink-600 bg-white bg-opacity-95 px-5 py-2 rounded-[1.5rem] shadow-[0_8px_15px_rgba(255,182,193,0.2)] border-4 border-pink-50 whitespace-nowrap transition-all hover:scale-110">
        {word.text}
      </span>
    </div>
  );
};

export default FallingWord;