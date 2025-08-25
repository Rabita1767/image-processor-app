"use client";
import Input from "@/components/atoms/input/input";
import { useEffect, useRef } from "react";
import ButtonGroup from "../../molecules/buttonGroup/buttonGroup";
import { Upload, Check, CheckCircle } from "lucide-react";
import socket from "@/socket/socket";
import { toast } from "react-toastify";
interface IDragAndDrop {
  onDrop: (files: File[]) => Promise<void>;
  isCompressionDone: boolean;
  isUploadComplete: boolean;
  setIsUploadComplete: React.Dispatch<React.SetStateAction<boolean>>;
  isDrop: boolean;
  setIsDrop: React.Dispatch<React.SetStateAction<boolean>>;
  active: number;
  setActive: React.Dispatch<React.SetStateAction<number>>;
}
const DragAndDrop: React.FC<IDragAndDrop> = ({
  onDrop,
  isCompressionDone,
  isUploadComplete,
  setIsUploadComplete,
  isDrop,
  setIsDrop,
  active,
  setActive,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    active: number
  ) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    if (active === 0 && files[0]) {
      await onDrop([files[0]]);
    } else if (active === 1) {
      await onDrop(files);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDrop(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDrop(false);
  };

  const handleInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e?.target?.files;
    if (!files || files.length === 0) {
      toast.error("Please upload file");
      return;
    }
    if (active === 0) {
      await onDrop([files[0]]);
    } else {
      await onDrop(Array.from(files));
    }
  };
  const handleRef = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  useEffect(() => {
    setIsDrop(false);
  }, [isCompressionDone]);

  return (
    <div className="flex flex-col gap-4 w-full pc:w-[50%] p-4">
      <p className="text-primary text-[18px] tab:text-[24px] font-bold">
        Compress Your Images
      </p>
      <ButtonGroup active={active} setActive={setActive} />
      <p className="text-primary text-[14px] tab:text-[16px]">Upload Image</p>
      <div
        className="border-1 border-dashed border-primary h-[400px] flex flex-col justify-center items-center cursor-pointer rounded-lg"
        onDrop={(e) => handleDrop(e, active)}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={handleRef}
      >
        <Input
          ref={inputRef}
          type="file"
          className="hidden"
          isRequired={false}
          onChange={(e) => handleInput(e)}
          value=""
        />
        {isUploadComplete ? (
          <CheckCircle className="w-8 h-8 text-primary" />
        ) : (
          <Upload
            className={`w-8 h-8 text-primary transform transition-transform duration-200 ${
              isDrop ? "scale-150" : ""
            }`}
          />
        )}
        <div className="p-4 bg-white">
          <p className="text-center text-black text-[14px] tab:text-[16px]">
            Drag and drop an image here, or click to select a file.
          </p>
        </div>
      </div>
    </div>
  );
};
export default DragAndDrop;
