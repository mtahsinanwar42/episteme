import { Navigate, Route, Routes } from "react-router-dom";
import Login from "@/pages/login";
import AuthCallback from "@/pages/authCallback";
import ProtectedRoute from "@/components/common/protectedRoute";
import Users from "@/pages/users";
import Home from "@/pages/home";

export default function RouteConfig() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route path="/" element={<Home />} />
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
  );
}
