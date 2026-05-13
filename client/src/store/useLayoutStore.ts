import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";


type LayoutState = {
  activeTab: string;
  selectedContact: string | null;
  username: string | null,
  profilePictures: string,
  setUsername: (name: string) => void
  setSelectedContact: (contact: string | null) => void;
  setActivedTab: (tab: string) => void;
  setProfilePictures: (image: string) => void
};

const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      activeTab: 'chats',
      selectedContact: null,
      username: null,
      profilePictures: "favicon.svg",
      setUsername: (name: string) => set({ username: name }),
      setSelectedContact: (contact: string | null) => set({ selectedContact: contact }),
      setActivedTab: (tab: string) => set({ activeTab: tab }),
      setProfilePictures: (image: string) => set({ profilePictures: image })
    }),
    {
      name: "layout-storage",
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export default useLayoutStore;