"use client";
import UserImageList from "@/components/molecules/userImageList/userImageList";
import { useGetUserImagesQuery } from "@/redux/services/api";
import { useEffect, useState } from "react";

const UserImage = () => {
  const { data: userImages, isSuccess, isLoading } = useGetUserImagesQuery();
  const [userImageData, setUserImageData] = useState<any>([]);

  useEffect(() => {
    if (!isSuccess) return;
    setUserImageData(userImages?.data || []);
  }, [isSuccess]);

  return (
    <div>
      <UserImageList data={userImageData ?? []} />
    </div>
  );
};

export default UserImage;
