'use client';
import DragAndDrop from "@/components/molecules/dragAndDrop/dragAndDrop";
import ImagePreview from "@/components/molecules/imagePreview/imagePreview";
import exampleImage from "@/app/assets/images/upload.png";
import { io } from "socket.io-client";
import { useEffect } from "react";

export default function Home() {
  const userId="T_Bovq9hfPWXuEmVAACO";
  const socket = io("http://localhost:8000",{autoConnect:false}); 
  useEffect(() => {
    // Connect once
    socket.connect();

    // Join a room based on user ID
    socket.emit("join", userId);

    socket.on("connect", () => {
      console.log("✅ Connected to server with ID:", socket.id);
    });

    // Listen for image compression completion
    socket.on("image-compressed", (data) => {
      console.log("📦 Image compression complete:", data);
      alert(`Image with ID ${data.imageId} has been compressed!`);
    });

    return () => {
      socket.disconnect(); // Clean up on unmount
    };
  }, []);
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-white">
        <DragAndDrop 
        onInputChange={(value: string) => console.log("value", value)}
        />
        <ImagePreview imgSrc={exampleImage} imgTitle="example.png"/>
    </div>
  );
}
