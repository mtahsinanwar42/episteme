import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string | null;
  user_metadata: Record<string, any>;
}

interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  initialize: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      loading: true,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),

      initialize: async () => {
        try {
          // set({ session, user: session?.user ?? null, loading: false });
        } catch (error) {
          console.error("Error initializing auth:", error);
          set({ loading: false });
        }
      },

      signInWithGoogle: async () => {
        try {
        } catch (error) {
          console.error("Error signing in with Google:", error);
          throw error;
        }
      },

      signOut: async () => {
        try {
          set({ user: null, session: null });
        } catch (error) {
          console.error("Error signing out:", error);
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ session: state.session }),
    },
  ),
);

export default useAuthStore;
