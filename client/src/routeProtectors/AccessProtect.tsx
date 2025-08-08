import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLoder from "@/components/ui/page-loder";

function AccessProtect({
  children,
  type, // e.g. "admin", "caller", etc.
}: {
  children: React.ReactNode;
  type: string;
}) {
  const navigate = useNavigate();
  const { admin, isAuthenticated, role } = useSelector(
    (state: RootState) => state.auth
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🛡️ AccessProtect check:", { 
      type, 
      admin: admin, 
      isAuthenticated, 
      role,
      adminRole: admin.user?.role 
    });
    
    // Check admin session for admin/branch access
    if (type === "admin") {
      if (!admin.isAuthenticated) {
        console.log("❌ Admin not authenticated, redirecting to /login");
        navigate("/login", { replace: true }); // Not logged in as admin
      } else if (!["admin", "branch"].includes(admin.user?.role || "")) {
        console.log("❌ Wrong admin role:", admin.user?.role, "redirecting to /");
        navigate("/", { replace: true }); // Wrong role
      } else {
        console.log("✅ Admin access granted for role:", admin.user?.role);
        setLoading(false); // Correct admin access
      }
    } else {
      // Legacy check for backward compatibility
      if (!isAuthenticated) {
        console.log("❌ Legacy: Not authenticated, redirecting to /login");
        navigate("/login", { replace: true }); // Not logged in
      } else if (role !== type) {
        console.log("❌ Legacy: Wrong role:", role, "expected:", type);
        navigate(-1 as any, { replace: true }); // Go back and replace history
      } else {
        console.log("✅ Legacy: Access granted for role:", role);
        setLoading(false); // Correct role
      }
    }
  }, [admin.isAuthenticated, admin.user?.role, isAuthenticated, role, type, navigate]);

  return <>{loading ? <PageLoder /> : children}</>;
}

export default AccessProtect;
