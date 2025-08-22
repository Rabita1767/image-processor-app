import React, { ReactNode } from "react";
import clsx from "clsx";

interface IButton {
  type?: "button" | "submit" | "reset";
  onClick?: (e?: React.FormEvent) => Promise<void> | void;
  btnText?: string | ReactNode;
  className?: string;
  icon?: ReactNode;
  isDisabled?: boolean;
}

const Button: React.FC<IButton> = ({
  type = "button",
  onClick,
  btnText = "Click Me",
  className,
  icon,
  isDisabled,
}) => {
  const buttonClass = clsx(
    "flex items-center justify-between gap-2",
    "bg-blue-500 px-4 py-2 rounded transition-colors duration-300 font-semibold",
    className,
    {
      "cursor-not-allowed opacity-50": isDisabled,
      "cursor-pointer": !isDisabled,
    }
  );

  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonClass}
      disabled={isDisabled}
    >
      {btnText}
      {icon && <span className="flex items-center">{icon}</span>}
    </button>
  );
};

export default Button;
