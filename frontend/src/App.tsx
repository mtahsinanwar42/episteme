import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useEffect } from "react";

import "@/App.css";
import { useThemeStore } from "@/stores/themeStore";
import Home from "@/pages/home";
import Footer from "@/features/footer";
import Navbar from "./features/navbar";
import Users from "@/pages/users";
import useAuthStore from "./stores/authStore";
import Login from "@/pages/login";
import AuthCallback from "./pages/authCallback";
import ProtectedRoute from "./components/common/protectedRoute";

function App() {
  const { theme } = useThemeStore();
  const { initialize, user } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="h-screen w-screen bg-background text-center text-foreground flex flex-col justify-between">
        <div>
          {user && <Navbar />}

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route path="/about" element={<div>About</div>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
