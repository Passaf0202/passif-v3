
import React from 'react';
import { Signal, Wifi, Battery } from 'lucide-react';

export const StatusBar = () => {
  return (
    <div className="status-bar">
      <span className="status-bar-time text-[#000000]">9:41</span>
      <div className="status-bar-icons">
        <Signal className="status-icon" />
        <Wifi className="status-icon" />
        <Battery className="status-icon" />
      </div>
    </div>
  );
};
