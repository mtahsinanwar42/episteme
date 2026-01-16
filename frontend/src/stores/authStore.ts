import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

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
          const {
            data: { session },
          } = await supabase.auth.getSession();
          set({ session, user: session?.user ?? null, loading: false });

          // Listen for auth changes
          supabase.auth.onAuthStateChange((_event, session) => {
            set({ session, user: session?.user ?? null });
          });
        } catch (error) {
          console.error("Error initializing auth:", error);
          set({ loading: false });
        }
      },

      signInWithGoogle: async () => {
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });
          if (error) throw error;
        } catch (error) {
          console.error("Error signing in with Google:", error);
          throw error;
        }
      },

      signOut: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
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
