import { IImageData } from "@/types/types";

interface UserImageListProps {
  data: IImageData[];
}

const UserImageList: React.FC<UserImageListProps> = ({ data }) => {
  return (
    <div className="min-h-screen px-6 py-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((image, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={image.originalImageUrl}
              alt={`User Image ${index + 1}`}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="p-3">
              <p className="text-sm font-medium text-gray-800 truncate">
                {image?.processedImageUrl
                  ? "Compression Completed"
                  : "Uploaded"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserImageList;
