
import React from 'react';

export const DynamicIsland = () => {
  return (
    <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[65px] h-[19px] rounded-[25px] z-50 isolate">
      <div className="absolute inset-0 bg-[#000000] rounded-[25px]" />
      <div className="absolute top-1/2 right-[22%] -translate-y-1/2 w-[4px] h-[4px] rounded-full">
        <div className="absolute inset-0 bg-[#000000] rounded-full" />
        <div className="absolute inset-[0.75px] bg-[#000000] rounded-full" />
        <div className="absolute inset-[1.25px] bg-[#000000] rounded-full" />
        <div className="absolute top-[25%] left-[25%] w-[0.5px] h-[0.5px] bg-white/15 rounded-full" />
      </div>
    </div>
  );
};
