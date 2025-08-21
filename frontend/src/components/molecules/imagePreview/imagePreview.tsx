"use client";
import Image, { StaticImageData } from "next/image";
import Button from "@/components/atoms/button/button";
import ProgressBar from "@/components/atoms/progressBar/progressBar";
import { File } from "buffer";

interface IImagePreview {
  imgSrc: string | StaticImageData;
  imgTitle: string;
  progress?: number;
  btnText?: string;
  clickHandler?: () => void;
}

const ImagePreview: React.FC<IImagePreview> = ({
  imgSrc,
  imgTitle,
  progress,
  btnText,
  clickHandler,
}) => {
  return (
    <div className="flex flex-col w-[80%] mx-auto border-1 border-lightBlue p-4 rounded-lg items-center gap-4">
      <div className="flex flex-row gap-2 justify-between w-full">
        <div>
          <Image
            src={imgSrc || "https://via.placeholder.com/100"}
            alt="compressed-image"
            width={100}
            height={100}
          />
        </div>
        <div>{imgTitle}</div>
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
