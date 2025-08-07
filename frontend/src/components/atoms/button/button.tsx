import React from "react";
import clsx from "clsx";

interface IButton {
  type?: "button" | "submit" | "reset";
  onClick?: (e?: React.FormEvent) => Promise<void> | void;
  btnText?: string;
  className?: string;
}

const Button: React.FC<IButton> = ({
  type = "button",
  onClick,
  btnText = "Click Me",
  className,
}) => {
  const buttonClass = clsx(
    "bg-blue-500 text-white px-4 py-2 rounded transition-colors duration-300",
    "hover:bg-blue-600",
    className
  );

  return (
    <button type={type} onClick={onClick} className={buttonClass}>
      {btnText}
    </button>
  );
};

export default Button;
