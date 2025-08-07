"use client";
import DragAndDrop from "@/components/molecules/dragAndDrop/dragAndDrop";
import ImagePreview from "@/components/molecules/imagePreview/imagePreview";
import exampleImage from "@/app/assets/images/upload.png";
import { useEffect, useState } from "react";
import socket from "@/socket/socket";
import { IImage } from "@/types/types";
import Button from "@/components/atoms/button/button";
export default function Home() {
  const [originalImage, setOriginalImage] = useState<File[]>([]);
  const [image, setImage] = useState<IImage[]>([]);

  const handleImageDrop = (file: File) => {
    if (!socket.connected) {
      socket.connect();
    }
    setOriginalImage((prev) => [...prev, file]);
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

  const handleDownload = async (url: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/image/download/${encodeURIComponent(
          url
        )}`
      );

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "compressed.jpg";
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading:", err);
    }
  };

  useEffect(() => {
    socket.on("notification", (data) => {
      console.log("Got notification:", data);
      setImage((prev) => [
        ...prev,
        {
          originalImageFile: data?.originalImageUrl,
          fileName: data?.fileName,
          imageId: data?.imageId,
          compressedImageFile: data?.compressedImageUrl,
          progress: 100,
          done: true,
        },
      ]);
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
    const intervals: NodeJS.Timeout[] = [];

    // Loop over all images
    image.forEach((img, index) => {
      if (img.done && img.progress < 100) {
        const interval = setInterval(() => {
          setImage((prevImages) => {
            const updatedImages = [...prevImages];
            const current = updatedImages[index];

            if (current.progress >= 100) {
              clearInterval(interval);
              current.progress = 100;
            } else {
              current.progress += 5;
            }

            return updatedImages;
          });
        }, 50);

        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [image]);

  return (
    <div className="flex flex-col items-center justify-center w-full bg-white">
      <div className="flex justify-end mt-10 w-full px-10">
        <Button
          onClick={() => {
            console.log("clicked");
          }}
          type="submit"
          btnText="Register"
        />
      </div>
      <DragAndDrop
        onInputChange={(value: string) => console.log("value", value)}
        onDrop={handleImageDrop}
      />
      {originalImage &&
        originalImage.length > 0 &&
        originalImage.map((img: any, index: number) => (
          <ImagePreview
            key={index}
            imgSrc={
              image[index]?.progress === 100
                ? image[index]?.compressedImageFile
                : image[index]?.originalImageFile || exampleImage
            }
            imgTitle="example.png"
            progress={image[index]?.progress || 0}
            btnText={
              image[index]?.done ? "Download" : "Compression in Progress"
            }
            clickHandler={() =>
              handleDownload(image[index]?.compressedImageFile)
            }
          />
        ))}
    </div>
  );
}
