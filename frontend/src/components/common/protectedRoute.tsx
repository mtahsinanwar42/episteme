import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "@/stores/store";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const loading = useSelector((state: RootState) => state.auth.loading);

  if (loading) {
    return (
      <div
        className="relative min-h-screen"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <LoadingOverlay visible />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
