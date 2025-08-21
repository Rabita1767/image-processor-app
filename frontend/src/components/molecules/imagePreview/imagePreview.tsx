"use client";
import Image, { StaticImageData } from "next/image";
import Button from "@/components/atoms/button/button";
import ProgressBar from "@/components/atoms/progressBar/progressBar";
import { File } from "buffer";

interface IImagePreview {
  imgSrc: string | StaticImageData;

  progress?: number;
  btnText?: string;
  clickHandler?: () => void;
}

const ImagePreview: React.FC<IImagePreview> = ({
  imgSrc,

  progress,
  btnText,
  clickHandler,
}) => {
  return (
    <div className="flex flex-col w-full h-[170px] mx-auto border border-lightBlue p-4 rounded-lg items-center gap-4 mb-4">
      <div className="flex flex-row gap-2 justify-between w-full">
        <div className="w-[100px] h-[100px] relative">
          <Image
            src={imgSrc || "https://via.placeholder.com/100"}
            alt="compressed-image"
            fill
            className="object-contain p-[8px] rounded-[8px]"
          />
        </div>
        <div>
          <Button
            onClick={clickHandler ? clickHandler : () => {}}
            type="submit"
            btnText={btnText}
            className="bg-primary rounded-[24px] text-white"
          />
        </div>
      </div>
      <ProgressBar progress={progress ?? 0} />
    </div>
  );
};
export default ImagePreview;
