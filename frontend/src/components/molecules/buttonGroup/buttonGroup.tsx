import Button from "@/components/atoms/button/button";
import { useState } from "react";

const ButtonGroup = () => {
  const [active, setActive] = useState(0);
  return (
    <div className="flex flex-row w-full gap-[2px] bg-lightBlue justify-between rounded">
      <Button
        onClick={() => {
          setActive(0);
        }}
        type="submit"
        btnText="Single Image"
        className={`rounded w-full ${
          active === 0 ? "bg-white shadow-md" : "bg-lightBlue"
        } text-primary m-[4px]`}
      />
      <Button
        onClick={() => {
          setActive(1);
        }}
        type="submit"
        btnText="Bulk Compression"
        className={`rounded w-full ${
          active === 1 ? "bg-white shadow-md" : "bg-lightBlue"
        } text-primary m-[4px]`}
      />
    </div>
  );
};

export default ButtonGroup;
