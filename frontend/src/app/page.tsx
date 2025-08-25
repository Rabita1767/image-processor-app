"use client";
import DragAndDrop from "@/components/organisms/dragAndDrop/dragAndDrop";
import ImagePreview from "@/components/molecules/imagePreview/imagePreview";
import exampleImage from "@/app/assets/images/upload.png";
import { useEffect, useState } from "react";
import socket from "@/socket/socket";
import { IImage, IImageResponse } from "@/types/types";
import { useRouter } from "next/navigation";
import Header from "@/components/molecules/header/header";
import LeftHeader from "@/components/atoms/leftHeader/leftHeader";
import { toast } from "react-toastify";
import CompressionSlider from "@/components/molecules/compressionSlider/compressionSlider";
import { getUserIdFromToken, normalizeFilename } from "@/utils/util";
import {
  useCompressImageMutation,
  useUploadImageMutation,
  useBulkUploadImageMutation,
} from "@/redux/services/api";
import imageCompression from "browser-image-compression";
import { format } from "path";
import build from "next/dist/build";

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
  const [active, setActive] = useState(0);
  const [bulkImages, setBulkImages] = useState<any>([]);
  const [
    uploadImage,
    { data: uploadedImageData, isSuccess, isLoading, isError, error },
  ] = useUploadImageMutation();
  const [
    bulkUploadImage,
    {
      data: bulkUploadImageData,
      isSuccess: isBulkUploadImageSuccess,
      isLoading: isBulkUoloadImageLoading,
      isError: isBulkUploadImageError,
    },
  ] = useBulkUploadImageMutation();
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
    if (Array.isArray(file)) {
      console.error("cant upload more than one file");
    }
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

  const handleBulkImageDrop = async (files: File[]) => {
    if (!files || !Array.isArray(files)) {
      toast.error("Something went wrong!Try again");
      return;
    }
    if (files.length > 10) {
      toast.error("Can't upload more than 10 files at once!");
      return;
    }
    const maxFileSizeMB = parseFloat(
      process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "0"
    );
    const thresholdFileSize = parseFloat(
      process.env.NEXT_PUBLIC_PRECOMPRESS_THRESHOLD_MB || "0"
    );
    const formData = new FormData();
    const uniqueId = crypto.randomUUID();
    for (let i = 0; i < files.length; i++) {
      const fileSizeMB = files[i].size / 1024 / 1024;
      if (fileSizeMB > maxFileSizeMB) {
        toast.error(
          `File too large! Maximum allowed size is ${maxFileSizeMB} MB.`
        );
        return;
      }
      let fileToUpload = files[i];

      if (fileSizeMB > thresholdFileSize) {
        fileToUpload = await imageCompression(files[i], {
          maxSizeMB: thresholdFileSize,
          maxWidthOrHeight: 5000,
          useWebWorker: true,
        });
      }
      fileToUpload = normalizeFilename(fileToUpload);
      formData.append("images", fileToUpload);
      setImage((prev) => [
        ...prev,
        {
          rawFile: fileToUpload,
          trackingId: uniqueId,
          originalImageFile: "",
          compressedImageFile: "",
          fileName: fileToUpload.name,
          imageId: "",
          uploadProgress: 0,
          compressProgress: 0,
          done: false,
          hasCompressionStarted: false,
        },
      ]);
    }
    formData.append("trackingId", uniqueId);
    if (!userId) formData.append("guestId", guestId);
    const response = await bulkUploadImage(formData);
  };

  const handleFilesDrop = async (files: File[]) => {
    if (active === 0) {
      // Single image mode
      if (files[0]) await handleImageDrop(files[0]);
    } else {
      // Bulk mode
      await handleBulkImageDrop(files);
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
    window.location.href = "/";
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
  }, []);

  useEffect(() => {
    if (!isSuccess) return;
    setImage((prev) => {
      if (prev.length === 0) return prev;
      return prev.map((img, index) => {
        return img.trackingId === uploadedImageData?.data?.trackingId ||
          img.trackingId === bulkUploadImageData?.data?.trackingId
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
    if (!isCompressionSuccess) return;
  }, [isCompressionSuccess]);

  useEffect(() => {
    if (!isBulkUploadImageSuccess || !bulkUploadImageData?.data) return;

    const uploadedImages = bulkUploadImageData.data;

    const uploadedMap = new Map<string, IImageResponse>(
      uploadedImages.map((u: IImageResponse) => [
        `${u.trackingId}-${u.filename}`,
        u,
      ])
    );

    setImage((prev: IImage[]) =>
      prev.map((img) => {
        const uploaded = uploadedMap.get(`${img.trackingId}-${img.fileName}`);

        if (uploaded) {
          return {
            ...img,
            imageId: uploaded._id,
            originalImageFile: uploaded.originalImageUrl,
            uploadProgress: 100,
            done: true,
          };
        }

        return img;
      })
    );
  }, [isBulkUploadImageSuccess, bulkUploadImageData]);

  return (
    <div className="flex flex-col items-center justify-center w-full bg-white p-4 tab:p-12 relative">
      <Header logoutHandler={handleLogout} hasToken={hasToken} isHomePage />
      <div className="w-full flex flex-col-reverse pc:flex-row justify-between my-10">
        <div className="flex flex-col gap-4 p-4 w-full pc:w-[45%] justify-between">
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
          onDrop={handleFilesDrop}
          isCompressionDone={isCompressionDone}
          isUploadComplete={isUploadComplete}
          setIsUploadComplete={setIsUploadComplete}
          isDrop={isDrop}
          setIsDrop={setIsDrop}
          active={active}
          setActive={setActive}
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
