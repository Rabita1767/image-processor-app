'use client';
import Image, { StaticImageData } from "next/image";
import Button from "@/components/atoms/button/button";
import ProgressBar from "@/components/atoms/progressBar/progressBar";

interface IImagePreview {
    imgSrc: string | StaticImageData;
    imgTitle:string;
}

const ImagePreview:React.FC<IImagePreview>=({imgSrc,imgTitle})=>{
    return(
        <div className="flex flex-col w-[80%] mx-auto border-2 border-gray-300 p-4 rounded-lg items-center gap-4">
        <div className="flex flex-row gap-2 justify-between w-full">
            <div className="w-[20%]">
                <Image src={imgSrc} alt="compressed-image" width={100} height={100}/>
            </div>
            <div className="w-[55%]">{imgTitle}</div>
            <div className="w-[20%]">
                <Button onClick={()=>{console.log("clicked")}} type="submit"/>
            </div>
        </div>
        <ProgressBar progress={50} />
        </div>
    )
}
 export default ImagePreview;