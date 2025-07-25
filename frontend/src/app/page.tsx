'use client';
import DragAndDrop from "@/components/molecules/dragAndDrop/dragAndDrop";
import ImagePreview from "@/components/molecules/imagePreview/imagePreview";
import exampleImage from "@/app/assets/images/upload.png";
import { io } from "socket.io-client";

export default function Home() {
  const socket = io("http://localhost:8000"); 
  socket.on("connect", () => {
    console.log("Connected to server with ID:", socket.id);
});
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-white">
        <DragAndDrop 
        onInputChange={(value: string) => console.log("value", value)}
        />
        <ImagePreview imgSrc={exampleImage} imgTitle="example.png"/>
    </div>
  );
}
