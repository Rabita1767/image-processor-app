"use client";
import DragAndDrop from "@/components/molecules/dragAndDrop/dragAndDrop";
import ImagePreview from "@/components/molecules/imagePreview/imagePreview";
import exampleImage from "@/app/assets/images/upload.png";
import { useEffect, useState } from "react";
import socket from "@/socket/socket";
export default function Home() {
  const [hasUploaded, setHasUploaded] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleImageDrop = (file: File) => {
    if (!socket.connected) {
      socket.connect();
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result;
      console.log("base64", base64);
      socket.emit("authentication", {
        base64Image: base64,
        fileName: file?.name,
      });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    socket.on("notification", (data) => {
      console.log("Got notification:", data);
      setImage(data?.compressedImageUrl);
      setIsDone(true);
    });
    socket.on("hello", (data) => {
      console.log("helloooooo", data);
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });
  }, []);

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

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-white">
      <DragAndDrop
        onInputChange={(value: string) => console.log("value", value)}
        onDrop={handleImageDrop}
      />
      <ImagePreview
        imgSrc={image || exampleImage}
        imgTitle="example.png"
        progress={progress}
      />
    </div>
  );
}
