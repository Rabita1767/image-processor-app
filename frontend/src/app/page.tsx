'use client';
import DragAndDrop from "@/components/molecules/dragAndDrop/dragAndDrop";
import ImagePreview from "@/components/molecules/imagePreview/imagePreview";
import exampleImage from "@/app/assets/images/upload.png";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-white">
        <DragAndDrop 
        onInputChange={(value: string) => console.log("value", value)}
        />
        <ImagePreview imgSrc={exampleImage} imgTitle="example.png"/>
    </div>
  );
}
