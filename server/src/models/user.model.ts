import mongoose, { mongo } from "mongoose";

export interface IUser {
  phoneNumber: string,
  phoneSuffix: string,
  username: string,
  email: string,
  emailOtp: string | null,
  otpExprire: Date | null,
  profilePictures: string,
  about: string,
  lastSeen: Date,
  isOnline: boolean,
  isVerified: boolean,
  agreed: boolean,
  createdAt: Date,
  updatedAt: Date,
}

const userSchema = new mongoose.Schema<IUser>({
  phoneNumber: { type: String, unique: true, sparse: true },
  phoneSuffix: { type: String, unique: false },
  username: String,
  email: {
    type: String,
    lowercase: true,
    validate: {
      validator: function (value: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: "Invalid email format",
    },
  },
  emailOtp: String,
  otpExprire: Date,
  profilePictures: String,
  about: String,
  lastSeen: Date,
  isOnline: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  agreed: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;