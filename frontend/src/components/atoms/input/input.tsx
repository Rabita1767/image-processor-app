import React from "react";
import clsx from "clsx";

interface IInput {
  className?: string;
  type?: string;
  value?: string;
  isRequired?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
}

const Input: React.FC<IInput> = ({
  className,
  type = "text",
  value,
  isRequired,
  onChange,
  placeholder,
}) => {
  return (
    <div>
      <input
        className={clsx(
          "px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
          className
        )}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={isRequired}
        placeholder={placeholder}
      />
    </div>
  );
};

export default Input;
