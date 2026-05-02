import React from "react";

type LoaderProps = {
  text?: string;
};

const Loader: React.FC<LoaderProps> = ({ text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      {/* Spinner */}
      <div className="w-12 h-12 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>

      {/* Optional Text */}
      <p className="mt-4 text-white text-sm">{text}</p>
    </div>
  );
};

export default Loader;