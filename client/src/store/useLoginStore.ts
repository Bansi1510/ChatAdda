import { create } from "zustand";
import { persist } from "zustand/middleware";


type LoginState = {
  step: number;
  email: string | null
  phoneNumber: string | null;
  phoneSuffix: string | null;
  setStep: (step: number) => void;
  setUserPhoneData: (data: object) => void;
  resetLoginState: () => void;
};
const useLoginStore = create<LoginState>()(
  persist(
    (set) => ({
      step: 1,
      email: null,
      phoneNumber: null,
      phoneSuffix: null,
      setStep: (step) => set({ step }),
      setUserPhoneData: (data) => set(data),
      resetLoginState: () => set({ step: 1, phoneNumber: null })
    }),
    {
      name: "login-storage",
      partialize: (state) => ({ step: state.step, phoneNumber: state.phoneNumber })
    }
  )
)

export default useLoginStore;