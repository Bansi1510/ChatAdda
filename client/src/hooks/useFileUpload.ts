import { useState } from "react";

const useFileUpload = () => {
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [filePreview, setFilePreview] =
    useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const preview =
        URL.createObjectURL(file);

      setFilePreview(preview);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  return {
    selectedFile,
    filePreview,
    handleFileChange,
    removeFile,
  };
};

export default useFileUpload;