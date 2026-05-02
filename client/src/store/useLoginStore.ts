import { create } from "zustand";
import { persist } from "zustand/middleware";


type LoginState = {
  step: number;
  userPhoneData: string | null;

  setStep: (step: number) => void;
  setUserPhoneData: (data: string) => void;
  resetLoginState: () => void;
};
const useLoginStore = create<LoginState>()(
  persist(
    (set) => ({
      step: 1,
      userPhoneData: null,
      setStep: (step) => set({ step }),
      setUserPhoneData: (data) => set({ userPhoneData: data }),
      resetLoginState: () => set({ step: 1, userPhoneData: null })
    }),
    {
      name: "login-storage",
      partialize: (state) => ({ step: state.step, userPhoneData: state.userPhoneData })
    }
  )
)

export default useLoginStore;