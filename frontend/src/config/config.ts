export const config = {
  baseUrl: import.meta.env["VITE_BASE_URL"] || "http://localhost:3000",
  supabase: {
    url: import.meta.env["VITE_SUPABASE_URL"],
    anonKey: import.meta.env["VITE_SUPABASE_ANON_KEY"],
  },
};
