import React, { useRef, useState } from "react";
import {
  Mail,
  Phone,
  Info,
  ShieldCheck,
  Pencil,
  Camera,
} from "lucide-react";

import useThemeStore from "../store/useThemeStore";
import useUserStore from "../store/useUserStore";
import { updateUserProfile } from "../services/user.service";
import { toast } from "react-toastify";

const User: React.FC = () => {
  const { theme } = useThemeStore();
  const { user } = useUserStore();

  const isDark = theme === "dark";

  const [isEditing, setIsEditing] = useState(false);

  const [username, setUsername] = useState(
    user?.username || ""
  );

  const [about, setAbout] = useState(
    user?.about || ""
  );

  const [profilePic, setProfilePic] = useState(
    user?.profilePictures || ""
  );
  const [profileFile, setProfileFile] =
    useState<File | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const cardStyle = isDark
    ? "bg-[#202c33] border-[#2f3b43]"
    : "bg-white border-gray-200 shadow-sm";

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      setProfileFile(file);

      const imageUrl = URL.createObjectURL(file);
      setProfilePic(imageUrl);
    }
  };

  const handleSave = async () => {
    // API call here

    console.log({
      username,
      about,
      profilePic,
    });
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("about", about ?? user?.about);
      formData.append("agreed", "true");
      if (profileFile) {
        formData.append("media", profileFile);
      }
      const res = await updateUserProfile(formData);

      if (res.status == "success") {
        toast.success(res.message);

      }

    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsEditing(false);
    }

  };

  return (
    <div
      className={`relative h-full pb-36 min-h-0 overflow-y-auto transition-all duration-300 ${isDark
        ? "bg-[#111b21] text-white"
        : "bg-[#f0f2f5] text-black"
        }`}
    >
      {/* Edit Button */}
      <button
        onClick={() => {
          if (isEditing) {
            handleSave();
          } else {
            setIsEditing(true);
          }
        }}
        className={`absolute top-5 right-5 p-2 rounded-full transition ${isDark
          ? "bg-[#202c33] hover:bg-[#2a3942]"
          : "bg-white hover:bg-gray-100 shadow"
          }`}
      >
        <Pencil size={18} />
      </button>

      {/* Profile Section */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4">
        {/* Profile Image */}
        <div className="relative">
          {profilePic ? (
            <img
              src={profilePic}
              alt={username || "User"}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-semibold shadow-md ${isDark
                ? "bg-[#202c33]"
                : "bg-gray-300"
                }`}
            >
              {username
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>
          )}

          {/* Camera Button */}
          {isEditing && (
            <button
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full shadow-md"
            >
              <Camera size={15} />
            </button>
          )}

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Username */}
        {isEditing ? (
          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className={`mt-4 px-3 py-2 rounded-lg text-center outline-none border ${isDark
              ? "bg-[#202c33] border-[#2f3b43]"
              : "bg-white border-gray-300"
              }`}
          />
        ) : (
          <h1 className="mt-4 text-xl font-semibold">
            {username || "Unknown User"}
          </h1>
        )}

        {/* About */}
        {isEditing ? (
          <textarea
            value={about}
            onChange={(e) =>
              setAbout(e.target.value)
            }
            rows={3}
            className={`mt-3 w-full max-w-xs px-3 py-2 rounded-xl text-sm outline-none border resize-none ${isDark
              ? "bg-[#202c33] border-[#2f3b43]"
              : "bg-white border-gray-300"
              }`}
          />
        ) : (
          <p
            className={`text-sm mt-1 text-center ${isDark
              ? "text-gray-400"
              : "text-gray-500"
              }`}
          >
            {about ||
              "Hey there! I am using ChatAdda"}
          </p>
        )}

        {/* Online Status */}
        <div
          className={`mt-3 px-3 py-1 rounded-full text-xs font-medium ${user?.isOnline
            ? "bg-green-500/15 text-green-500"
            : isDark
              ? "bg-gray-700 text-gray-300"
              : "bg-gray-200 text-gray-600"
            }`}
        >
          {user?.isOnline
            ? "Online"
            : "Offline"}
        </div>
      </div>

      {/* Info Cards */}
      <div className="px-4 pb-6 space-y-3">
        {/* Email */}
        <div
          className={`border rounded-2xl p-4 flex items-center gap-3 ${cardStyle}`}
        >
          <Mail
            size={20}
            className="text-green-500"
          />

          <div>
            <p className="text-xs text-gray-400">
              Email
            </p>

            <h2 className="text-sm font-medium break-all">
              {user?.email || "Not added"}
            </h2>
          </div>
        </div>

        {/* Phone */}
        <div
          className={`border rounded-2xl p-4 flex items-center gap-3 ${cardStyle}`}
        >
          <Phone
            size={20}
            className="text-blue-500"
          />

          <div>
            <p className="text-xs text-gray-400">
              Phone
            </p>

            <h2 className="text-sm font-medium">
              {user?.phoneNumber ||
                "Not added"}
            </h2>
          </div>
        </div>

        {/* About */}
        <div
          className={`border rounded-2xl p-4 flex items-center gap-3 ${cardStyle}`}
        >
          <Info
            size={20}
            className="text-yellow-500"
          />

          <div>
            <p className="text-xs text-gray-400">
              About
            </p>

            <h2 className="text-sm font-medium">
              {about || "No about added"}
            </h2>
          </div>
        </div>

        {/* Verification */}
        <div
          className={`border rounded-2xl p-4 flex items-center gap-3 ${cardStyle}`}
        >
          <ShieldCheck
            size={20}
            className="text-emerald-500"
          />

          <div>
            <p className="text-xs text-gray-400">
              Verification
            </p>

            <h2 className="text-sm font-medium">
              {user?.isVerified
                ? "Verified Account"
                : "Not Verified"}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;