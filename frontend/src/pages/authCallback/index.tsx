import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "@/stores/store";

function AuthCallback() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const loading = useSelector((state: RootState) => state.auth.loading);

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
