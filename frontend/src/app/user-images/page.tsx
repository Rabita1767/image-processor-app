"use client";
import UserImageList from "@/components/molecules/userImageList/userImageList";
import LayoutTemplate from "@/components/templates/layoutTemplate";
import { useGetUserImagesQuery } from "@/redux/services/api";
import { useEffect, useState } from "react";

const UserImage = () => {
  const { data: userImages, isSuccess, isLoading } = useGetUserImagesQuery();
  const [userImageData, setUserImageData] = useState<any>([]);

  useEffect(() => {
    if (!isSuccess) return;
    setUserImageData(userImages?.result || []);
  }, [isSuccess]);

  return (
    <div className="p-4 tab:p-12 min-h-screen">
      <LayoutTemplate
        isHomePage
        children={<UserImageList data={userImageData ?? []} />}
        noData={userImages?.result.length === 0}
      />
    </div>
  );
};

export default UserImage;
