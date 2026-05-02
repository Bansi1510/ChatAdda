import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";


type UserState = {
  user: object | null;
  isAuthenticated: boolean;

  setUser: (userData: object) => void;
  clearUser: () => void;
};
const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (userData) => set({ user: userData, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false })
    }),
    {
      name: "login-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useUserStore;