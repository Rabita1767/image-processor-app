import Button from "@/components/atoms/button/button";
import React, { useState } from "react";

interface IButtonGroupProps {
  active: number;
  setActive: React.Dispatch<React.SetStateAction<number>>;
}

const ButtonGroup: React.FC<IButtonGroupProps> = ({ active, setActive }) => {
  return (
    <div className="flex flex-row w-full gap-[2px] bg-lightBlue justify-between rounded">
      <Button
        onClick={() => {
          setActive(0);
        }}
        type="submit"
        btnText="Single Image"
        className={`rounded w-full text-[14px] tab:text-[20px] ${
          active === 0 ? "bg-white shadow-md" : "bg-lightBlue"
        } text-primary m-[4px]`}
        isButtonGroup
      />
      <Button
        onClick={() => {
          setActive(1);
        }}
        type="submit"
        btnText="Bulk Compression"
        className={`rounded w-full text-[14px] tab:text-[20px] ${
          active === 1 ? "bg-white shadow-md" : "bg-lightBlue"
        } text-primary m-[4px]`}
        isButtonGroup
      />
    </div>
  );
};

export default ButtonGroup;
