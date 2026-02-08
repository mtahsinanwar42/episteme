import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "@/stores/store";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import type { UserRole } from "@/models/user";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const loading = useSelector((state: RootState) => state.auth.loading);
  const location = useLocation();

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
    const targetPath = `${location.pathname}${location.search}${location.hash}`;
    const loginPath = `/login?redirectUrl=${encodeURIComponent(targetPath)}`;
    return <Navigate to={loginPath} replace />;
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.some((role) => user.roles?.includes(role))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
