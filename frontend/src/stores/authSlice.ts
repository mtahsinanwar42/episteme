import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  email: string | null;
  user_metadata: Record<string, any>;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.session = null;
      state.loading = false;
    },
  },
});

export const { setUser, setSession, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
