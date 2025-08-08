import { useSelector } from "react-redux";
import type { RootState } from "../store/index";
import { Navigate } from "react-router-dom";
function LoginRP({ children }: { children: React.ReactNode }) {
  const { admin } = useSelector((state: RootState) => state.auth);
  // console.log(admin);

  if (admin.isAuthenticated && ["admin", "branch"].includes(admin.user?.role || "")) {
    // If already logged in as admin and trying to go to /login, redirect to admin dashboard
    return <Navigate to={"/admin/dashboard"} replace />;
  }

  return children;
}

export default LoginRP;
