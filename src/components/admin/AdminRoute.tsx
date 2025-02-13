
import { Navigate, Outlet } from "react-router-dom";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const AdminRoute = () => {
  const { isAdmin, isLoading } = useAdminGuard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
