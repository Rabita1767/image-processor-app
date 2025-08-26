import noData from "@/app/assets/images/no-data.png";
import Image from "next/image";

interface UserImageListProps {
  data: { originalImageUrl: string; filename: string }[];
}

const UserImageList: React.FC<UserImageListProps> = ({ data }) => {
  return (
    <>
      {data && data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 ">
          {data.map((image, index) => (
            <div key={index} className="border rounded-lg  shadow-md">
              <img
                src={image.originalImageUrl}
                alt={`User Image ${index + 1}`}
                className="w-full h-full object-cover rounded-t-lg"
                loading="lazy"
              />
              <div className="p-2">
                <p className="text-sm text-gray-600">{image.filename}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <Image src={noData} alt="No Data" />
        </div>
      )}
    </>
  );
};

export default UserImageList;
