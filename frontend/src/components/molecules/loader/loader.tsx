"use client";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  isLoading: boolean;
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ isLoading, fullScreen = true }) => {
  if (!isLoading) return null;

  return (
    <div
      className={`${
        fullScreen ? "fixed inset-0" : "absolute inset-0 rounded-[8px]"
      } flex items-center justify-center bg-white/50 backdrop-blur-sm z-50`}
    >
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );
};

export default Loader;
