
import React, { useEffect, useState } from 'react';
import { DiamondViewer } from '../home/DiamondViewer';

interface FloatingDiamond {
  id: number;
  x: number;
  y: number;
  scale: number;
  speed: number;
}

export function DiamondWall() {
  const [diamonds, setDiamonds] = useState<FloatingDiamond[]>([]);

  useEffect(() => {
    // Create initial diamonds with random positions and sizes
    const initialDiamonds = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: 0.3 + Math.random() * 0.7, // Random size between 0.3 and 1
      speed: 0.2 + Math.random() * 0.5, // Random speed
    }));
    setDiamonds(initialDiamonds);

    // Animation loop
    const interval = setInterval(() => {
      setDiamonds(prevDiamonds => 
        prevDiamonds.map(diamond => ({
          ...diamond,
          y: (diamond.y + diamond.speed) % 100, // Loop back to top when reaching bottom
          x: diamond.x + Math.sin(diamond.y / 30) * 0.2, // Gentle side-to-side movement
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-48 md:hidden bg-background overflow-hidden relative">
      {diamonds.map((diamond) => (
        <div 
          key={diamond.id}
          className="absolute"
          style={{
            left: `${diamond.x}%`,
            top: `${diamond.y}%`,
            transform: `scale(${diamond.scale})`,
            transition: 'transform 0.5s ease-out',
          }}
        >
          <div className="w-12 h-12">
            <DiamondViewer state="initial" />
          </div>
        </div>
      ))}
    </div>
  );
}
