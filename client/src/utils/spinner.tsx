import React from "react";

type SpinnerProps = {
  size?: number;        // px
  color?: string;       // tailwind color class
  className?: string;
};

const Spinner: React.FC<SpinnerProps> = ({
  size = 40,
  color = "border-green-500",
  className = "",
}) => {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-gray-300 ${color} ${className}`
      }
      style={{
        width: size,
        height: size,
        borderTopColor: "currentColor",
      }}
    />
  );
};

export default Spinner;