import axios from "axios";
import baseUrl from "./baseApi.service";

type SendOtpPayload = {
  email?: string;
  phoneNumber?: string;
  phoneSuffix?: string;
};
export const sendOtpAPI = async ({ email, phoneNumber, phoneSuffix }: SendOtpPayload) => {
  try {
    const res = await baseUrl.post(`/user/send-otp`, { email, phoneNumber, phoneSuffix });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || "API Error";
    }
  }
}

type verifyOtpPayload = {
  email?: string;
  phoneNumber?: string;
  phoneSuffix?: string;
  otp: string
}
export const verifyOtpAPI = async ({ email, phoneNumber, phoneSuffix, otp }: verifyOtpPayload) => {
  try {
    const res = await baseUrl.post(`/user/verify-otp`, { email, phoneNumber, phoneSuffix, otp });
    console.log(res)
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || "API Error";
    }
  }
}



export const updateUserProfile = async (updateData: FormData) => {
  try {
    const res = await baseUrl.put("/user/update-profile", updateData);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || "API Error";
    }
  }
}




export const checkUserAutheticatedAPI = async () => {
  try {
    const res = await baseUrl.get("/user/profile");

    if (res.data.status === 'success') {
      return { isAutheticated: true, user: res.data.user }
    } else if (res.data.status === 'error') {
      return { isAutheticated: false }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || "API Error";
    }
  }
}

export const getAllUsersAPI = async () => {
  try {
    const res = await baseUrl.get("/user/users");
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || "API Error";
    }
  }
}
