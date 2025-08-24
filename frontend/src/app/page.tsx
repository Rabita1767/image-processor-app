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
import { toast } from "react-toastify";
import CompressionSlider from "@/components/molecules/compressionSlider/compressionSlider";
import { getUserIdFromToken } from "@/utils/util";
import {
  useCompressImageMutation,
  useUploadImageMutation,
} from "@/redux/services/api";
import imageCompression from "browser-image-compression";
import { format } from "path";

export default function Home() {
  const router = useRouter();
  const [image, setImage] = useState<IImage[]>([]);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [guestId, setGuestId] = useState<string>("");
  const [isCompressionDone, setIsCompressionDone] = useState<boolean>(false);
  const [isUploadComplete, setIsUploadComplete] = useState<boolean>(false);
  const [isClicked, setIsClicked] = useState(false);
  const [compressionValue, setCompressionValue] = useState<number>(50);
  const [isDrop, setIsDrop] = useState<boolean>(false);
  const [userId, setUserId] = useState("");
  const [
    uploadImage,
    { data: uploadedImageData, isSuccess, isLoading, isError, error },
  ] = useUploadImageMutation();
  const [
    compressImage,
    {
      isSuccess: isCompressionSuccess,
      isLoading: isCompressionLoading,
      data: compressedImageData,
      isError: isCompressionError,
    },
  ] = useCompressImageMutation();

  const handleImageDrop = async (file: File) => {
    const fileSizeMB = file.size / 1024 / 1024;
    const maxFileSizeMB = parseFloat(
      process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "0"
    );
    if (fileSizeMB > maxFileSizeMB) {
      toast.error(
        `File too large! Maximum allowed size is ${maxFileSizeMB} MB.`
      );
      return;
    }
    setIsUploadComplete(false);
    setIsCompressionDone(false);
    let fileToUpload = file;
    const thresholdFileSize = parseFloat(
      process.env.NEXT_PUBLIC_PRECOMPRESS_THRESHOLD_MB || "0"
    );
    //  Pre-compress only if above threshold
    if (fileSizeMB > thresholdFileSize) {
      fileToUpload = await imageCompression(file, {
        maxSizeMB: thresholdFileSize,
        maxWidthOrHeight: 5000,
        useWebWorker: true,
      });
    }
    const uniqueId = crypto.randomUUID();
    const formData = new FormData();
    formData.append("image", fileToUpload);
    formData.append("trackingId", uniqueId);
    const newFile: IImage = {
      rawFile: fileToUpload,
      trackingId: uniqueId,
      originalImageFile: "",
      compressedImageFile: "",
      fileName: fileToUpload?.name,
      imageId: "",
      uploadProgress: 0,
      compressProgress: 0,
      done: false,
      hasCompressionStarted: false,
    };
    setImage((prev) => [...prev, newFile]);
    if (userId) {
      await uploadImage(formData);
    } else {
      formData.append("guestId", guestId);
      await uploadImage(formData);
    }
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
    setHasToken(false);
    socket.disconnect();
    socket.io.opts.query = { userId: guestId };
    socket.auth.token = "";
    router.push("/");
  };

  const compressHandler = async (imageId: string) => {
    if (!socket.connected) {
      hasToken
        ? (socket.io.opts.query = { userId: userId })
        : (socket.io.opts.query = { userId: guestId });
      socket.connect();
    }
    setImage((prev) => {
      if (prev.length === 0) return prev;
      return prev.map((img, index) => {
        return img.imageId === imageId
          ? {
              ...img,
              hasCompressionStarted: true,
            }
          : img;
      });
    });
    try {
      if (userId) {
        const payload = {
          compressionValue: compressionValue,
        };
        await compressImage({
          imageId,
          payload: payload,
        }).unwrap();
        return;
      }

      const res = await compressImage({
        imageId,
        payload: { compressionValue: compressionValue, guestId: guestId },
      }).unwrap();
    } catch (err) {
      console.error("Compression failed:", err);
    }
  };
  useEffect(() => {
    socket.on("notification", (data) => {
      setIsCompressionDone(true);
      setIsClicked(false);
      console.log("Got notification:", data);
      if (data?.message) {
        toast.success(data?.message);
      }
      setImage((prev) => {
        if (prev.length === 0) return prev;
        return prev.map((img, index) => {
          return img.imageId === data?.imageId
            ? {
                ...img,
                compressedImageFile: data?.compressedImageUrl,
                compressProgress: 100,
                done: true,
              }
            : img;
        });
      });
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
      if (img.done && img.uploadProgress < 100) {
        const interval = setInterval(() => {
          setImage((prevImages) => {
            const updatedImages = [...prevImages];
            const current = updatedImages[index];

            if (current.uploadProgress >= 100) {
              clearInterval(interval);
              current.uploadProgress = 100;
            } else {
              current.uploadProgress += 5;
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
    console.log("whyyy");
  }, []);

  console.log("hdehgd", guestId);

  useEffect(() => {
    if (!isSuccess) return;
    setImage((prev) => {
      if (prev.length === 0) return prev;
      return prev.map((img, index) => {
        return index === prev.length - 1
          ? {
              ...img,
              imageId: uploadedImageData?.data?._id,
              originalImageFile: uploadedImageData?.data?.originalImageUrl,
              uploadProgress: 100,
              done: true,
            }
          : img;
      });
    });
  }, [isSuccess]);
  console.log("ehdwd", hasToken);

  useEffect(() => {
    if (!isCompressionSuccess) return;
  }, [isCompressionSuccess]);

  console.log("iiiiiii", socket.io.opts.query);
  return (
    <div className="flex flex-col items-center justify-center w-full bg-white p-12 relative">
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
              img.uploadProgress === 100
                ? img?.originalImageFile
                : img.compressProgress === 100
                ? img?.compressedImageFile
                : exampleImage
            }
            hasCompressionStarted={img.hasCompressionStarted}
            isCompressionProgress={
              img.uploadProgress === 100 && img.compressProgress < 100
            }
            progress={img?.uploadProgress || 0}
            btnText={
              img?.uploadProgress < 100
                ? "Uploading..."
                : img?.uploadProgress === 100 && img.compressProgress < 100
                ? "Compress"
                : img.hasCompressionStarted &&
                  img?.uploadProgress === 100 &&
                  img.compressProgress < 100
                ? "Compressing..."
                : img?.uploadProgress === 100 && img.compressProgress === 100
                ? "Download"
                : "Downloading..."
            }
            clickHandler={
              img?.uploadProgress === 100 && img.compressProgress < 100
                ? () => compressHandler(img.imageId)
                : img?.uploadProgress === 100 && img.compressProgress === 100
                ? () => handleDownload(img.compressedImageFile)
                : () => {}
            }
          />
        ))}
    </div>
  );
}
