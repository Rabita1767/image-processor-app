import React, { forwardRef } from "react";
import clsx from "clsx";

interface IInput {
  className?: string;
  type?: string;
  value?: string;
  isRequired?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const Input = forwardRef<HTMLInputElement, IInput>(
  (
    { className, type = "text", value, isRequired, onChange, placeholder },
    ref
  ) => {
    return (
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
    );
  }
);
Input.displayName = "Input";

export default Input;
