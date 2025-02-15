
import React from 'react';

export const StatusBar = () => {
  return (
    <div className="absolute top-0 left-0 right-0 h-[44px] px-6 pr-4 flex items-center justify-between mobile-status-bar">
      <span className="font-semibold text-[9px] tracking-wide pure-black-text translate-y-[1px]">9:41</span>
      <div className="flex items-center gap-[1px] translate-y-[1px]">
        <div className="scale-[0.6] -mr-[2px]">
          <img 
            src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/status_icons/signal-bars.png" 
            alt="Signal"
            className="h-[12px] w-[18px] pure-black-fill"
          />
        </div>

        <span className="text-[6.5px] font-semibold pure-black-text -mr-[1px]">5G</span>

        <div className="relative h-[13px] w-[24px] scale-[0.6]">
          <img 
            src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/status_icons/battery-icon.png" 
            alt="Battery"
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
};
