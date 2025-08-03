"use client";
import DragAndDrop from "@/components/molecules/dragAndDrop/dragAndDrop";
import ImagePreview from "@/components/molecules/imagePreview/imagePreview";
import exampleImage from "@/app/assets/images/upload.png";
import { useEffect, useState } from "react";
import { useUploadAndCompressAsGuestMutation } from "@/redux/services/api";
import { io } from "socket.io-client";
import socket from "@/socket/socket";
export default function Home() {
  const [uploadImageAsGuest, { data, isSuccess, isLoading, isError, error }] =
    useUploadAndCompressAsGuestMutation();
  const [currentUserId, setCurrentUserId] = useState("");
  const [hasUploaded, setHasUploaded] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleImageDrop = (file: File) => {
    // try {
    //   setHasUploaded(true);
    //   setImage(file);
    //   console.log("fileeeeeee", file);
    //   // const formData = new FormData();
    //   // formData.append("image", file);
    //   // const response = await uploadImageAsGuest(formData).unwrap();
    //   // console.log("response", response);
    // } catch (error) {
    //   console.error("Upload failed:", error);
    // }
    setHasUploaded(true);
    setImage(file);
  };

  useEffect(() => {
    const guestUserId = localStorage.getItem("guestId") ?? "";
    console.log("guestUserId", guestUserId);
    setCurrentUserId(guestUserId);
  }, [isSuccess]);
  console.log("before entering", image);

  useEffect(() => {
    console.log("entering", currentUserId);
    if (!currentUserId) return;
    if (!socket.connected) {
      socket.connect(); // only connect once
    }

    socket.emit("hello", {
      data: "hello",
    });
    console.log("enter inside condition", currentUserId);
    socket.emit("authentication", {
      userId: currentUserId,
      imageBuffer: image,
      fileName: image?.name,
    });
    if (hasUploaded) {
      console.log("hasUploaded", hasUploaded);
      socket.on("notification", (data) => {
        console.log("receiveddddd", data);
        setIsDone(true);
      });
    }
  }, [currentUserId, hasUploaded]);

  useEffect(() => {
    if (isSuccess) {
      setHasUploaded(false);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isDone) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          } else {
            return prev + 5;
          }
        });
      }, 50);
    } else {
      setProgress(0);
    }
  }, [isDone]);
  console.log("prooo", image);

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

  console.log("gues", currentUserId);
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-white">
      <DragAndDrop
        onInputChange={(value: string) => console.log("value", value)}
        onDrop={handleImageDrop}
      />
      <ImagePreview
        imgSrc="https://res.cloudinary.com/dxj18oq5m/image/upload/v1754053817/1754053813926-699597742.jpg"
        imgTitle="example.png"
        progress={progress}
      />
    </div>
  );
}
