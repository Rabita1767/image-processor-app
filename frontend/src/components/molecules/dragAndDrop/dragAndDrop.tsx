'use client';
import Input from "@/components/atoms/input/input";
import { useCallback, useState } from "react";
import Image from "next/image";
import UploadImage from "@/app/assets/images/upload.png";
interface IDragAndDrop {
    onInputChange: (value:string) => void;

}
const DragAndDrop:React.FC<IDragAndDrop>=({onInputChange})=>{
    const [preview, setPreview] = useState<string | null>(null);
    const [isDrop,setIsDrop] = useState<boolean>(false);
const onDrop=useCallback((e:React.DragEvent<HTMLDivElement>)=>{
    e.preventDefault();
    setIsDrop(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/"))
    {
        const imageUrl = URL.createObjectURL(file);
        setPreview(imageUrl);
    }
},[]);

console.log("preview", preview);

const onDragOver=(e:React.DragEvent<HTMLDivElement>)=>{
    e.preventDefault();
    setIsDrop(true);
}

const onDragLeave=(e:React.DragEvent<HTMLDivElement>)=>{
    e.preventDefault();
    setIsDrop(false);
}

    return(
        
            <div className="flex flex-col gap-4 w-[80%] mx-auto my-10 p-4">
            <p className="text-black text-[24px] font-bold">Upload photos</p>
            <div className="border-2 border-dashed border-gray-300 h-[500px] flex flex-col justify-center items-center cursor-pointer rounded-lg"
            onDrop={onDrop}
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
            <Image src={UploadImage} alt="upload-icon" className="w-[10%]"/>
                <div className={`p-4 ${isDrop ? "bg-gray-100" : "bg-white"}`}>
                    {/* {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-auto" />
                    ) : (
                        <p className="text-center text-gray-500">Drag and drop an image here, or click to select a file.</p>
                    )}    */}
                    <p className="text-center text-black text-[22px]">Drag and drop an image here, or click to select a file.</p>
                </div>      
            </div>
            </div>

    )

}
export default DragAndDrop;