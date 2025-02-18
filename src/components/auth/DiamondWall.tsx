
import React from 'react';

export function DiamondWall() {
  return (
    <div className="h-48 md:hidden bg-gradient-to-br from-gray-900 to-black">
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-12 h-12 bg-white transform rotate-45"></div>
      </div>
    </div>
  );
}
