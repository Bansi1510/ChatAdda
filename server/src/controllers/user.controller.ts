import { Request, Response } from "express";
import otpGenerator from "../utils/otpGenerator";
import User from "../models/user.model";
import response from "../utils/responseHandler";
import sendOtpToEmail from "../services/emailService";
import { sendOtpToNumber, verifyOtpNumber } from "../services/twilio";
import generateToken from "../utils/generateToken";

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
    const token = generateToken(user?._id.toString());

    res.cookie("auth_token", token, {
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000
    })
    return response(res, 200, 'otp verified sucessfully', { token, user })

  } catch (error) {
    console.log(error);
    return response(res, 500, 'internal server error');
  }
}