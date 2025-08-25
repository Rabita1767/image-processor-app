"use client";
import Image, { StaticImageData } from "next/image";
import Button from "@/components/atoms/button/button";
import ProgressBar from "@/components/atoms/progressBar/progressBar";
import { Loader2 } from "lucide-react";
import { File } from "buffer";
import Loader from "../loader/loader";

interface IImagePreview {
  imgSrc: string | StaticImageData;
  progress?: number;
  btnText?: string;
  hasCompressionStarted: boolean;
  isCompressionProgress: boolean;
  clickHandler?: () => void;
}

const ImagePreview: React.FC<IImagePreview> = ({
  imgSrc,
  progress,
  btnText,
  hasCompressionStarted,
  isCompressionProgress,
  clickHandler,
}) => {
  return (
    <div className="flex flex-col w-full h-[220px] tab:h-[170px] mx-auto border border-lightBlue p-4 rounded-lg items-center gap-4 mb-4">
      <div className="flex flex-col tab:flex-row gap-2 tab:justify-between w-full">
        <div className="w-[100px] h-[100px] relative">
          <Image
            src={imgSrc || "https://via.placeholder.com/100"}
            alt="compressed-image"
            fill
            className="object-contain p-[8px] rounded-[8px]"
          />
          <Loader
            isLoading={hasCompressionStarted && isCompressionProgress}
            fullScreen={false}
          />
        </div>

        <div>
          <Button
            onClick={clickHandler ? clickHandler : () => {}}
            type="submit"
            btnText={btnText}
            className="bg-primary rounded-[24px] text-white w-full tab:w-none text-[14px] tab:text-[18px]"
          />
        </div>
      </div>
      <ProgressBar progress={progress ?? 0} />
    </div>
  );
};
export default ImagePreview;
