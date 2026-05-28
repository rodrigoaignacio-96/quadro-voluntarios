import { create } from "zustand";
import { User } from "firebase/auth";

interface AppStore {
  /* Auth */
  user:          User | null;
  authLoading:   boolean;
  setUser:       (user: User | null) => void;
  setAuthLoading:(v: boolean) => void;

  /* Sidebar */
  sidebarOpen:   boolean;
  toggleSidebar: () => void;
  setSidebar:    (v: boolean) => void;

  /* UI */
  pageTitle:     string;
  setPageTitle:  (title: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  /* Auth */
  user:          null,
  authLoading:   true,
  setUser:       (user)    => set({ user }),
  setAuthLoading:(v)       => set({ authLoading: v }),

  /* Sidebar — fechado por padrão em mobile */
  sidebarOpen:   false,
  toggleSidebar: ()        => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar:    (v)       => set({ sidebarOpen: v }),

  /* UI */
  pageTitle:     "Dashboard",
  setPageTitle:  (title)   => set({ pageTitle: title }),
}));
