import { Request, Response } from "express";
import otpGenerator from "../utils/otpGenerator";
import User from "../models/user.model";
import response from "../utils/responseHandler";
import sendOtpToEmail from "../services/emailService";
import { sendOtpToNumber, verifyOtpNumber } from "../services/twilio";
import generateToken from "../utils/generateToken";
import { uploadToCloudinary } from "../config/upload";
import Conversation from "../models/conversation.model";

export const sendOtp = async (req: Request, res: Response) => {

  const { phoneNumber, phoneSuffix, email } = req.body;
  const otp = otpGenerator();
  const expiry = new Date(Date.now() + 5 * 60 * 1000);
  let user;
  try {
    if (email) {
      user = await User.findOne({ email });

      if (!user) {
        user = new User({ email });
      }
      user.emailOtp = otp;
      user.otpExprire = expiry;
      await user.save();

      await sendOtpToEmail(email, otp);

      return response(res, 200, 'otp sent on your email', { email })
    }
    if (!phoneNumber || !phoneSuffix) {
      return response(res, 400, "required phone number and country code required ")
    }
    const fullNumber = `${phoneSuffix}${phoneNumber}`
    user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({ phoneNumber, phoneSuffix })
    }

    await user.save();
    await sendOtpToNumber(fullNumber);
    return response(res, 200, 'otp send successfully', user);
  } catch (error) {
    console.log(error);
    return response(res, 500, 'internal server error');
  }
}

export const verifyOtp = async (req: Request, res: Response) => {
  const { phoneNumber, phoneSuffix, email, otp } = req.body;

  try {
    let user;
    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        return response(res, 404, 'user not found');
      }
      const now = new Date();
      if (!user.emailOtp || String(user.emailOtp) !== String(otp) || user.otpExprire && now > new Date(user.otpExprire)) {
        return response(res, 400, 'invalid or expired otp');
      }
      user.isVerified = true;
      user.emailOtp = null;
      user.otpExprire = null;
      await user.save();

    } else {
      if (!phoneNumber || !phoneSuffix) {
        return response(res, 400, 'required phone number and country code required ')
      }
      const fullNumber = `${phoneSuffix}${phoneNumber}`
      user = await User.findOne({ phoneNumber });
      if (!user) return response(res, 404, 'number not found');

      const result = await verifyOtpNumber(fullNumber, otp);

      if (result?.status !== "approved") {
        return response(res, 400, 'invalid or expired otp');
      }
      user.isVerified = true;
      await user.save();
    }
    const token = await generateToken(user?._id.toString());

    res.cookie("auth_token", token, {
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    return response(res, 200, 'otp verified sucessfully', { token, user })

  } catch (error) {
    console.log(error);
    return response(res, 500, 'internal server error');
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  const { username, agreed, about } = req.body;
  const userId = req.user.userId;
  try {
    const user = await User.findById(userId);
    const file = req.file;
    if (!user) return response(res, 401, 'you are not autheticated')
    if (file) {
      const fileUrl = await uploadToCloudinary(file.path);
      if (fileUrl) user.profilePictures = fileUrl;
    } else if (req.body.profilePictures) {
      user.profilePictures = req.body.profilePictures
    }
    if (username) user.username = username;
    if (agreed) user.agreed = agreed;
    if (about) user.about = about;

    await user.save();

    return response(res, 200, 'user profile updated', user);

  } catch (error) {
    console.log(error);
    return response(res, 500, 'internal server error');
  }
}

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return response(res, 401, "You are not autheticated");
    }

    const user = await User.findById(userId);
    if (!user) return response(res, 404, "user not found");

    return response(res, 200, "you are autheticated", user);

  } catch (error) {
    console.log(error);
    return response(res, 500, 'internal server error');
  }
}
export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response(res, 200, "Logged out successfully");
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server error");
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const loggedInuserId = req.user.userId;

    const users = await User.find({ _id: { $ne: loggedInuserId } }).select("phoneNumber phoneSuffix username profilePictures lastSeen isOnline about").lean();

    const conversations = await Conversation.find({
      participants: loggedInuserId
    })
      .populate("lastMessage", "sender receiver content createdAt")
      .lean();

    const userChat = users.map((user) => {
      const chat = conversations.find((c) =>
        c.participants.some((p) => p.equals(user._id))
      );

      return {
        ...user,
        conversation: chat || 0,
      };
    });

    return response(res, 200, "user retrived successfully", userChat);
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server error");
  }
}