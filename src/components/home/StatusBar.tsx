
import React from 'react';

export const StatusBar = () => {
  return (
    <div className="absolute top-0 left-0 right-0 h-[44px] px-8 flex items-center justify-between z-50">
      <span className="font-semibold text-[9px] tracking-wide pure-black-text translate-y-[1px]">9:41</span>
      <div className="flex items-center translate-y-[1px] mr-[-10px]">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none" className="scale-[0.6]">
          <rect x="12" y="1" width="2" height="9" rx="0.7" className="pure-black-fill"/>
          <rect x="8.5" y="3" width="2" height="7" rx="0.7" className="pure-black-fill"/>
          <rect x="5" y="5" width="2" height="5" rx="0.7" className="pure-black-fill"/>
          <rect x="1.5" y="7" width="2" height="3" rx="0.7" className="pure-black-fill"/>
        </svg>

        <span className="text-[6.5px] font-semibold pure-black-text translate-y-[0px]">5G</span>

        <div className="relative h-[13px] w-[24px] translate-y-[0px]">
          <svg width="24" height="13" viewBox="0 0 24 13" fill="none" className="scale-[0.6]">
            <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" className="pure-black-stroke" strokeWidth="0.75"/>
            <rect x="2" y="2" width="18" height="8" rx="1.5" className="pure-black-fill"/>
            <rect x="22.5" y="3.5" width="1" height="5" rx="0.5" className="pure-black-fill"/>
          </svg>
        </div>
      </div>
    </div>
  );
};
