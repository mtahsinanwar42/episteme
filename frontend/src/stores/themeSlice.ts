import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ThemeType = "light" | "dark" | "emerald";

export interface ThemeState {
  theme: ThemeType;
}

const initialState: ThemeState = {
  theme: "light",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeType>) => {
      document.documentElement.setAttribute("data-theme", action.payload);
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      const next = state.theme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      state.theme = next;
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
