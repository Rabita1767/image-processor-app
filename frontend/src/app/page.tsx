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
import { useUploadImageMutation } from "@/redux/services/api";
import imageCompression from "browser-image-compression";

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

  // const handleImageDrop = (file: File) => {
  //   setIsUploadComplete(false);
  //   setIsCompressionDone(false);
  //   if (!socket.connected) {
  //     hasToken
  //       ? (socket.io.opts.query = { userId: userId })
  //       : (socket.io.opts.query = { userId: guestId });
  //     socket.connect();
  //   }

  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     const base64 = e.target?.result;
  //     if (!base64 || typeof base64 !== "string") {
  //       console.error("Failed to read file as base64");
  //       return;
  //     }
  //     const newFile: IImage = {
  //       base64: base64,
  //       originalImageFile: "",
  //       compressedImageFile: "",
  //       fileName: file?.name,
  //       imageId: "",
  //       progress: 0,
  //       done: false,
  //     };
  //     setImage((prev) => [...prev, newFile]);
  //     console.log("base64", base64);
  //     socket.emit("authentication", {
  //       base64Image: base64,
  //       fileName: file?.name,
  //     });
  //   };
  //   reader.readAsDataURL(file);
  // };

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
    const formData = new FormData();
    formData.append("image", fileToUpload);
    const newFile: IImage = {
      rawFile: fileToUpload,
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
    // setOriginalImage([]);
    setHasToken(false);
    socket.disconnect();
    socket.io.opts.query = { userId: guestId };
    socket.auth.token = "";
    router.push("/");
  };

  const compressHandler = (
    imageId: string,
    originalImageFile: string,
    base64: string,
    fileName: string
  ) => {
    console.log("clicked", imageId, originalImageFile);
    setIsUploadComplete(false);
    socket.emit("startCompression", {
      base64Image: base64,
      fileName: fileName,
      uploadedFileId: imageId,
      originalUrl: originalImageFile,
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
      setImage((prev) => {
        if (prev.length === 0) return prev;
        return prev.map((img, index) => {
          return img.imageId === data?.imageId
            ? {
                ...img,
                compressedImageFile: data?.compressedImageUrl,
                progress: 100,
                done: true,
              }
            : img;
        });
      });
    });
    socket.on("testing", (data) => {
      console.log("helloooooo", data);
    });
    socket.on("upload-success", (data) => {
      if (!data) return;

      toast.success(data.message);

      setIsUploadComplete(true);
      setIsDrop(false);
      setImage((prev) => {
        if (prev.length === 0) return prev;
        return prev.map((img, index) => {
          return index === prev.length - 1
            ? {
                ...img,
                originalImageFile: data?.imageUrl || "",
                imageId: data?.uploadedImgId || "",
              }
            : img;
        });
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
  }, []);

  useEffect(() => {
    if (!isSuccess) return;
    console.log("dataaaaaaaaaaaaaiiiiiii", uploadedImageData);
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

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

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

          {/* <Button
            onClick={compressHandler}
            type="submit"
            btnText="Compress File"
            className="rounded-[24px] bg-primary text-white w-full p-4"
            icon={<ArrowRightIcon />}
            isDisabled={!isUploadComplete || isCompressionDone || isClicked}
          /> */}
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
            progress={img?.uploadProgress || 0}
            btnText={img?.uploadProgress === 100 ? "Compress" : "Uploading"}
            clickHandler={() =>
              compressHandler(
                img.imageId,
                img.originalImageFile,
                img.base64,
                img.fileName
              )
            }
          />
        ))}
    </div>
  );
}
