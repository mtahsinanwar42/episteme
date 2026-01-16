import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/stores/authStore";

function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [user, loading, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div style={{ color: "var(--color-text)" }}>
        <p className="text-xl">Completing sign in...</p>
      </div>
    </div>
  );
}

export default AuthCallback;
