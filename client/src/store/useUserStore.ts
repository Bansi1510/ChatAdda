import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type User = {
  _id: string
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