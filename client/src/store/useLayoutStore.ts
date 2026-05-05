import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";


type LayoutState = {
  activeTab: string;
  selectedContact: string | null;
  setSelectedContact: (contact: string | null) => void;
  setActivedTab: (tab: string) => void;
};

const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      activeTab: 'chats',
      selectedContact: null,
      setSelectedContact: (contact: string | null) => set({ selectedContact: contact }),
      setActivedTab: (tab: string) => set({ activeTab: tab })
    }),
    {
      name: "layout-storage",
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export default useLayoutStore;