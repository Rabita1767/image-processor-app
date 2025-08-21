import { ChevronLeft } from "lucide-react";
import React from "react";

const LeftHeader = () => {
  return (
    <div className="flex flex-row gap-[2px] mb-4">
      <div className="flex justify-center items-center">
        <ChevronLeft className="w-6 h-6 text-primary" />
      </div>
      <p className="text-primary text-[24px] font-bold">Compression Options</p>
    </div>
  );
};

export default LeftHeader;
