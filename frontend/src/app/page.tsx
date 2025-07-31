'use client';
import DragAndDrop from "@/components/molecules/dragAndDrop/dragAndDrop";
import ImagePreview from "@/components/molecules/imagePreview/imagePreview";
import exampleImage from "@/app/assets/images/upload.png";
import { useEffect, useState } from "react";
import {useUploadAndCompressAsGuestMutation} from "@/redux/services/api";
import { io } from "socket.io-client";
import {getSocket} from "@/socket/socket";

export default function Home() {
  const [uploadImageAsGuest, { data, isSuccess, isLoading, isError, error }] =
  useUploadAndCompressAsGuestMutation();
  const [currentUserId,setCurrentUserId]=useState(null);
  const [image,setImage]=useState<File | null>(null);
  const handleImageDrop = async (file: File) => {
    try {
      setImage(file);
      const formData = new FormData();
      formData.append("image", file);

      const response = await uploadImageAsGuest(formData).unwrap();
      console.log("response", response);
      setCurrentUserId(response?.data?.guestId);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  useEffect(()=>{
    if(!currentUserId) return;
    const socket=getSocket(currentUserId);
    socket.connect();
    socket.emit("send-image",{
      imageFile: image,
      userId: currentUserId
    })
    socket.on("compression-progress",(data:any)=>{
      console.log("Compression progress:", data);
      alert(`Image with ID ${data.imageId} is ${data.progress}% compressed!`);
    })
    if(socket)
    {
      return ()=>{
        socket.disconnect();
      }
    }

  },[currentUserId]);

 
  // Initialize socket connection
  // useEffect(() => {
  //   if (!userId || typeof window === "undefined") return;
  
  //   const socket = io("http://localhost:8000", {
  //     query: { userId },
  //   });
  
  //   // Connect once
  //   socket.connect();
  
  //   // Join a room based on user ID
  //   socket.emit("join", userId);
  
  //   socket.on("connect", () => {
  //     console.log("Connected to socket server");
  //   });
  
  //   // ✅ Listen outside connect event
  //   socket.on("image-compressed", (data) => {
  //     console.log("completeddddddddd", data);
  //     alert(`Image with ID ${data.imageId} has been compressed!`);
  //   });
  
  //   return () => {
  //     socket.disconnect(); // Clean up on unmount
  //   };
  // }, [userId]);
  
  console.log("gues",currentUserId);
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-white">
        <DragAndDrop 
        onInputChange={(value: string) => console.log("value", value)}
        onDrop={handleImageDrop}
        />
        <ImagePreview imgSrc={exampleImage} imgTitle="example.png"/>
    </div>
  );
}
