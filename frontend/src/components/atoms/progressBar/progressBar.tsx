// src/components/ui/ProgressBar.tsx
import React from "react";

interface ProgressBarProps {
  progress: number; // value from 0 to 100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="flex flex-row items-center justify-between w-full gap-2">
      <div className="w-full bg-gray-200 rounded-full h-[8px] shadow-inner">
        <div
          className="h-full rounded-full transition-all duration-500 ease-in-out"
          style={{
            width: `${progress}%`,
            backgroundColor: progress == 0 ? "gray" : "var(--primary)",
          }}
        />
      </div>
      <div className="text-sm font-medium text-gray-800">{progress}%</div>
    </div>
  );
};

export default ProgressBar;
