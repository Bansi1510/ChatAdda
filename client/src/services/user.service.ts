import axios from "axios";
import baseUrl from "./baseApi.service";

export const sendOtpAPI = async ({ email, phoneNumber, phoneSuffix }: { email: string | null; phoneNumber: string | null; phoneSuffix: string | null }) => {
  try {
    const res = await baseUrl.post(`/user/send-otp`, { email, phoneNumber, phoneSuffix });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || "API Error";
    }
  }
}

export const verifyOtpAPI = async ({ email, phoneNumber, phoneSuffix, otp }: { email: string | null; phoneNumber: string | null; phoneSuffix: string | null, otp: string }) => {
  try {
    const res = await baseUrl.post(`/user/verify-otp`, { email, phoneNumber, phoneSuffix, otp });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || "API Error";
    }
  }
}


type updateDataType = {
  username: string | null,
  agreed: boolean | null,
  about: string | null,
  image: File | null
}
export const updateUserProfile = async (updateData: updateDataType) => {
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
