import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";


type ThemeState = {
  theme: string;
  setTheme: (theme: string) => void
};
const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme })
    }),
    {
      name: "login-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useThemeStore;