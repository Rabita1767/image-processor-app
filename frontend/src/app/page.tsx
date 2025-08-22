"use client";
import DragAndDrop from "@/components/molecules/dragAndDrop/dragAndDrop";
import ImagePreview from "@/components/molecules/imagePreview/imagePreview";
import exampleImage from "@/app/assets/images/upload.png";
import { useEffect, useState } from "react";
import socket from "@/socket/socket";
import { IImage } from "@/types/types";
import { useRouter } from "next/navigation";
import Header from "@/components/molecules/header/header";
import LeftHeader from "@/components/leftHeader/leftHeader";
import Button from "@/components/atoms/button/button";
import { ArrowRightIcon } from "lucide-react";
import { toast } from "react-toastify";
import CompressionSlider from "@/components/molecules/compressionSlider/compressionSlider";
import Loader from "@/components/molecules/loader/loader";
import { getUserIdFromToken } from "@/utils/util";

export default function Home() {
  const router = useRouter();
  // const [originalImage, setOriginalImage] = useState<File[]>([]);
  const [image, setImage] = useState<IImage[]>([]);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [guestId, setGuestId] = useState<string>("");
  const [isCompressionDone, setIsCompressionDone] = useState<boolean>(false);
  const [isUploadComplete, setIsUploadComplete] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<{
    base64: string;
    fileName: string;
  } | null>(null);
  const [uploadedImgId, setUploadedImgId] = useState({
    id: "",
    imageUrl: "",
  });
  const [isClicked, setIsClicked] = useState(false);
  const [compressionValue, setCompressionValue] = useState<number>(50);
  const [isDrop, setIsDrop] = useState<boolean>(false);
  const [userId, setUserId] = useState("");

  const handleImageDrop = (file: File) => {
    setIsUploadComplete(false);
    setIsCompressionDone(false);
    if (!socket.connected) {
      hasToken
        ? (socket.io.opts.query = { userId: userId })
        : (socket.io.opts.query = { userId: guestId });
      socket.connect();
    }
    // setOriginalImage((prev) => [...prev, file]);
    const newFile: IImage = {
      rawFile: file,
      originalImageFile: "",
      compressedImageFile: "",
      fileName: "",
      imageId: "",
      progress: 0,
      done: false,
    };
    setImage((prev) => [...prev, newFile]);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result;
      if (!base64 || typeof base64 !== "string") {
        console.error("Failed to read file as base64");
        return;
      }

      setUploadedFile({
        base64,
        fileName: file?.name,
      });
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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    setImage([]);
    // setOriginalImage([]);
    setHasToken(false);
    socket.disconnect();
    socket.io.opts.query = { userId: guestId };
    socket.auth.token = "";
    router.push("/");
  };

  const compressHandler = () => {
    console.log("clicked");
    setIsUploadComplete(false);
    socket.emit("new-test", {
      base64Image: uploadedFile?.base64,
      fileName: uploadedFile?.file?.name,
      uploadedFileId: uploadedImgId?.id,
      originalUrl: uploadedImgId?.imageUrl,
      compressionValue: compressionValue,
    });
    setIsClicked(true);
  };

  useEffect(() => {
    socket.on("notification", (data) => {
      setIsCompressionDone(true);
      setIsClicked(false);
      console.log("Got notification:", data);
      if (data?.message) {
        toast.success(data?.message);
      }
      // setImage((prev) => [
      //   ...prev,
      //   {
      //     originalImageFile: data?.originalImageUrl,
      //     fileName: data?.fileName,
      //     imageId: data?.imageId,
      //     compressedImageFile: data?.compressedImageUrl,
      //     progress: 100,
      //     done: true,
      //   },
      // ]);

      setImage((prev) => {
        if (prev.length === 0) return prev;
        return prev.map((img, index) => {
          return index === prev.length - 1
            ? {
                ...img,
                originalImageFile: data?.originalImageUrl,
                fileName: data?.fileName,
                imageId: data?.imageId,
                compressedImageFile: data?.compressedImageUrl,
                progress: 100,
                done: true,
              }
            : img;
        });
      });
    });
    socket.on("hello", (data) => {
      console.log("helloooooo", data);
    });
    socket.on("upload-success", (data) => {
      if (!data) return;

      toast.success(data.message);

      setIsUploadComplete(true);
      setIsDrop(false);
      setUploadedImgId({
        id: data?.uploadedImgId || "",
        imageUrl: data?.imageUrl || "",
      });
    });

    return () => {
      socket.off("upload-success");
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

  useEffect(() => {
    if (typeof window !== undefined) {
      const token = localStorage.getItem("accessToken") || "";

      if (!token) return;
      const currentUserId = getUserIdFromToken(token);
      setUserId(currentUserId ?? "");
      setHasToken(true);
    }
  }, []);

  useEffect(() => {
    const guestId = localStorage.getItem("guestId") || "guest";
    setGuestId(guestId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full bg-white p-12 relative">
      {/* <Loader isLoading={isDrop && !isUploadComplete} /> */}
      <Header logoutHandler={handleLogout} hasToken={hasToken} isHomePage />
      <div className="w-full flex flex-row justify-between my-10">
        <div className="flex flex-col gap-4 p-4 w-[45%] justify-between">
          <div>
            <LeftHeader />
            <CompressionSlider
              min={10}
              max={100}
              step={5}
              onChange={(val) => setCompressionValue(val)}
            />
          </div>

          <Button
            onClick={compressHandler}
            type="submit"
            btnText="Compress File"
            className="rounded-[24px] bg-primary text-white w-full p-4"
            icon={<ArrowRightIcon />}
            isDisabled={!isUploadComplete || isCompressionDone || isClicked}
          />
        </div>
        <DragAndDrop
          onInputChange={(value: string) => console.log("value", value)}
          onDrop={handleImageDrop}
          isCompressionDone={isCompressionDone}
          isUploadComplete={isUploadComplete}
          setIsUploadComplete={setIsUploadComplete}
          isDrop={isDrop}
          setIsDrop={setIsDrop}
        />
      </div>

      {image &&
        image.length > 0 &&
        image.map((img: any, index: number) => (
          <ImagePreview
            key={index}
            imgSrc={
              img.progress === 100
                ? img?.compressedImageFile
                : img?.originalImageFile || exampleImage
            }
            progress={img?.progress || 0}
            btnText={img?.done ? "Download" : "Compression in Progress"}
            clickHandler={() =>
              handleDownload(image[index]?.compressedImageFile)
            }
          />
        ))}
    </div>
  );
}
