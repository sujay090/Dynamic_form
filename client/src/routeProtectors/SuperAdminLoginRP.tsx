import { useSelector } from "react-redux";
import type { RootState } from "../store/index";
import { Navigate } from "react-router-dom";

function SuperAdminLoginRP({ children }: { children: React.ReactNode }) {
  const { superAdmin } = useSelector((state: RootState) => state.auth);

  if (superAdmin.isAuthenticated && superAdmin.user?.role === "super-admin") {
    // If already logged in as super-admin and trying to go to /super-admin/login, redirect to super-admin panel
    return <Navigate to={"/admin/super-admin"} replace />;
  }

  return children;
}

export default SuperAdminLoginRP;
