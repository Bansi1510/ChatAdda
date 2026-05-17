import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface User {
  phoneNumber?: string;
  phoneSuffix?: string;
  username?: string;
  email?: string;
  emailOtp?: string | null;
  otpExprire?: Date | null;
  profilePictures?: string;
  about?: string;
  lastSeen?: Date;
  isOnline?: boolean;
  isVerified?: boolean;
  agreed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  _id: string;
}
type UserState = {
  user: User | null;
  isAuthenticated: boolean;

  setUser: (userData: User) => void;
  clearUser: () => void;
};
const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (userData: User) => set({ user: userData, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false })
    }),
    {
      name: "login-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useUserStore;