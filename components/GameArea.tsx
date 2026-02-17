import React, { useEffect, useState } from 'react';
import { Character, Word, HpLossIndicator } from '../types';
import FallingWord from './FallingWord';
import HpLossIndicatorComponent from './HpLossIndicator';
import { CHARACTER_HEIGHT, CHARACTER_WIDTH, GAME_AREA_HEIGHT, GAME_AREA_WIDTH } from '../constants';

interface GameAreaProps {
  fallingWords: Word[];
  selectedCharacter: Character | null;
  currentInput: string;
  hpLossIndicators: HpLossIndicator[];
}

const GameArea: React.FC<GameAreaProps> = ({ fallingWords, selectedCharacter, currentInput, hpLossIndicators }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      // 좌우 여백을 20px로 줄여 모바일에서 최대한 넓게 보이게 함
      const availableWidth = window.innerWidth - 20;
      // 상단 HUD와 하단 입력을 고려한 가용 높이 설정
      const availableHeight = window.innerHeight - 200;
      
      const scaleW = availableWidth / GAME_AREA_WIDTH;
      const scaleH = availableHeight / GAME_AREA_HEIGHT;
      
      // 화면 밖으로 나가지 않도록 최소 비율 선택 (최대 1.0)
      setScale(Math.min(1, scaleW, scaleH));
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex items-center justify-center overflow-visible" style={{ height: GAME_AREA_HEIGHT * scale, width: GAME_AREA_WIDTH * scale }}>
      <div
        className="relative rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden border-[6px] sm:border-[10px] border-white shadow-2xl origin-center"
        style={{ 
          width: GAME_AREA_WIDTH, 
          height: GAME_AREA_HEIGHT,
          transform: `scale(${scale})`,
          background: 'linear-gradient(to bottom, #BDE3FF 0%, #FDF2F8 60%, #D4ED91 100%)',
        }}
      >
        {/* Decorative Clouds */}
        <div className="absolute top-10 left-10 w-24 h-10 bg-white bg-opacity-60 rounded-full blur-sm animate-pulse"></div>
        <div className="absolute top-20 right-20 w-32 h-12 bg-white bg-opacity-40 rounded-full blur-md"></div>
        
        {fallingWords.map((word) => (
          <FallingWord key={word.id} word={word} />
        ))}

        {hpLossIndicators.map((indicator) => (
          <HpLossIndicatorComponent key={indicator.id} indicator={indicator} />
        ))}

        {selectedCharacter && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <img
              src={selectedCharacter.imageUrl}
              alt={selectedCharacter.name}
              className="drop-shadow-[0_10px_10px_rgba(255,255,255,0.8)] object-contain filter brightness-110"
              style={{ width: CHARACTER_WIDTH, height: CHARACTER_HEIGHT }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://img.icons8.com/fluency/96/fairy.png';
              }}
            />
            <div className="mt-[-15px] z-10 px-6 py-1 bg-white bg-opacity-90 text-pink-500 text-sm font-bold rounded-full border-2 border-pink-100 shadow-md">
              {selectedCharacter.name}
            </div>
          </div>
        )}

        {currentInput && (
          <div className="absolute z-20 bottom-40 left-1/2 transform -translate-x-1/2 px-8 py-3 bg-white bg-opacity-95 border-4 border-pink-200 text-pink-500 text-3xl font-black rounded-[2rem] shadow-xl animate-bounce">
            {currentInput}
          </div>
        )}

        <div className="absolute bottom-0 w-full h-12 flex justify-around items-end px-4 pointer-events-none opacity-60">
          <span>🌸</span><span>🌼</span><span>🌷</span><span>🌸</span><span>🌼</span><span>🌷</span>
        </div>
      </div>
    </div>
  );
};

export default GameArea;