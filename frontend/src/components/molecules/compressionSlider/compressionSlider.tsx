"use client";
import { useState } from "react";

interface CompressionSliderProps {
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
}

const CompressionSlider: React.FC<CompressionSliderProps> = ({
  min = 10,
  max = 100,
  step = 5,
  onChange,
}) => {
  const [value, setValue] = useState<number>(50); // default 50%

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setValue(newValue);
    if (onChange) onChange(newValue);
  };

  return (
    <div className="flex flex-col gap-2 w-full p-4 border border-lightBlue rounded-xl">
      <label className="text-[14px] tab:text-[18px] text-primary font-semibold">
        Compression: {value}%
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full accent-primary cursor-pointer"
      />
    </div>
  );
};

export default CompressionSlider;
