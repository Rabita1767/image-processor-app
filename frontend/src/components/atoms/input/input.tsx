import React, { forwardRef, useState } from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

interface IInput {
  className?: string;
  type?: string;
  value?: string;
  isRequired?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  showPassword?: boolean;
  setShowPassword?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Input = forwardRef<HTMLInputElement, IInput>(
  (
    {
      className,
      type = "text",
      value,
      isRequired,
      onChange,
      placeholder,
      showPassword,
      setShowPassword,
    },
    ref
  ) => {
    return (
      <>
        <input
          ref={ref}
          className={clsx(
            "px-3 py-2 border-[2px] border-lightBlue rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
            className
          )}
          type={type}
          value={value}
          onChange={onChange}
          required={isRequired}
          placeholder={placeholder}
        />
        {setShowPassword && (
          <span
            className="absolute right-2.5 top-5 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        )}
      </>
    );
  }
);
Input.displayName = "Input";

export default Input;
