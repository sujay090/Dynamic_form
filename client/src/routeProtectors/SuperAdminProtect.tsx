import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLoder from "@/components/ui/page-loder";

function SuperAdminProtect({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { superAdmin } = useSelector(
    (state: RootState) => state.auth
  );

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!superAdmin.isAuthenticated) {
      navigate("/super-admin/login", { replace: true }); // Not logged in, redirect to super admin login
    } else if (superAdmin.user?.role !== "super-admin") {
      navigate("/", { replace: true }); // Wrong role, redirect to home
    } else {
      setLoading(false); // Correct role (super-admin)
    }
  }, [superAdmin.isAuthenticated, superAdmin.user?.role, navigate]);

  return <>{loading ? <PageLoder /> : children}</>;
}

export default SuperAdminProtect;
