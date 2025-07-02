import { create } from "zustand";

interface I_User {
  id: string;
  email: string;
  name: string;
}

type ZustandStore = {
  userData: I_User | null;
  setUserData: (userData: I_User) => void;
};

export const useZustandStore = create<ZustandStore>((set) => ({
  userData: null,
  setUserData: (userData) => set({ userData }),
}));
