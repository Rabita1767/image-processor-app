"use client";
import Input from "@/components/atoms/input/input";
import { useEffect, useState } from "react";
import ButtonGroup from "../buttonGroup/buttonGroup";
import { Upload, Check, CheckCircle } from "lucide-react";
import socket from "@/socket/socket";
interface IDragAndDrop {
  onInputChange: (value: string) => void;
  onDrop: (file: File) => void;
  isCompressionDone: boolean;
  isUploadComplete: boolean;
  setIsUploadComplete: React.Dispatch<React.SetStateAction<boolean>>;
  isDrop: boolean;
  setIsDrop: React.Dispatch<React.SetStateAction<boolean>>;
}
const DragAndDrop: React.FC<IDragAndDrop> = ({
  onInputChange,
  onDrop,
  isCompressionDone,
  isUploadComplete,
  setIsUploadComplete,
  isDrop,
  setIsDrop,
}) => {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      onDrop(file);
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
  useEffect(() => {
    setIsDrop(false);
  }, [isCompressionDone]);

  return (
    <div className="flex flex-col gap-4 w-[50%] p-4">
      <p className="text-primary text-[24px] font-bold">Compress Your Images</p>
      <ButtonGroup />
      <p className="text-primary text-[16px]">Upload Image</p>
      <div
        className="border-1 border-dashed border-primary h-[400px] flex flex-col justify-center items-center cursor-pointer rounded-lg"
        onDrop={handleDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <Input
          type="file"
          className="hidden"
          isRequired={false}
          onChange={onInputChange}
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
          <p className="text-center text-black text-[16px]">
            Drag and drop an image here, or click to select a file.
          </p>
        </div>
      </div>
    </div>
  );
};
export default DragAndDrop;
