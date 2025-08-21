"use client";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  isLoading: boolean;
}

const Loader: React.FC<LoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );
};

export default Loader;
