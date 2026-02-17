import React, { useEffect, useState } from 'react';
import { HpLossIndicator } from '../types';

interface HpLossIndicatorProps {
  indicator: HpLossIndicator;
}

const HpLossIndicatorComponent: React.FC<HpLossIndicatorProps> = ({ indicator }) => {
  const [opacity, setOpacity] = useState(1);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const animationDuration = 1000; // milliseconds
    const startTime = indicator.timestamp;

    const animate = (currentTime: DOMHighResTimeStamp) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      setOpacity(1 - progress);
      setOffsetY(-50 * progress); // Move upwards

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [indicator.timestamp]);

  return (
    <div
      className="absolute text-pink-400 font-extrabold text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] select-none"
      style={{
        top: `${indicator.top + offsetY}px`,
        left: `${indicator.left}px`,
        transform: 'translateX(-50%)',
        opacity: opacity,
        zIndex: 20,
        pointerEvents: 'none', // Allow clicks/hovers to pass through
      }}
    >
      -1 HP
    </div>
  );
};

export default HpLossIndicatorComponent;