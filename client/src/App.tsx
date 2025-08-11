import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import type { AppDispatch } from "./store";
import { useDispatch } from "react-redux";
import { Suspense, useEffect, useState } from "react";
import { restoreAuthSessions } from "./utils/sessionPersistence";
import Login from "./pages/auth/Login";
import { SuperAdminLogin } from "./pages/auth/superAdmin";
import LoginRP from "./routeProtectors/LoginRP";
import AccessProtect from "./routeProtectors/AccessProtect";
import SuperAdminProtect from "./routeProtectors/SuperAdminProtect";
import SuperAdminLoginRP from "./routeProtectors/SuperAdminLoginRP";
// import Dashboard from "./pages/admin/Dashboard";
import { AdminRoutes } from "./routes/AdminRoutes";
import Layout from "./layouts/admin/Layout";
import PageLoder from "./components/ui/page-loder";
import SuperAdminPanel from "./pages/superAdmin/superAdmin";
function App() {
  const dispatch = useDispatch<AppDispatch>();
  const [loding, setLoding] = useState(true);
  
  useEffect(() => {
    // Add preload class to prevent animations during load
    document.body.classList.add('preload');
    
    // Clear session storage if it contains incompatible state
    try {
      const persistedState = sessionStorage.getItem('persist:root');
      if (persistedState) {
        const parsed = JSON.parse(persistedState);
        if (parsed.auth) {
          const authState = JSON.parse(parsed.auth);
          // If auth state doesn't have new structure, clear it
          if (!authState.admin || !authState.superAdmin) {
            console.log('Clearing incompatible auth state');
            sessionStorage.removeItem('persist:root');
          }
        }
      }
    } catch (error) {
      console.log('Clearing corrupted session storage');
      sessionStorage.clear();
    }
    
    // Restore both admin and superadmin sessions on app start
    restoreAuthSessions(dispatch);
    
    setLoding(false);
    
    // Remove preload class after a short delay to enable transitions
    setTimeout(() => {
      document.body.classList.remove('preload');
    }, 100);
  }, [dispatch]);

  return (
    <>
      {loding ? (
        <h1>loding</h1>
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                <LoginRP>
                  <Login />
                </LoginRP>
              }
            />
            <Route
              path="/super-admin/login"
              element={
                <SuperAdminLoginRP>
                  <SuperAdminLogin />
                </SuperAdminLoginRP>
              }
            />
            <Route
              path="/admin"
              element={
                <AccessProtect type="admin">
                  <Suspense fallback={<PageLoder />}>
                    <Layout />
                  </Suspense>
                </AccessProtect>
              }
            >
              {AdminRoutes}
            </Route>
            
            <Route
              path="/admin/super-admin"
              element={
                <SuperAdminProtect>
                  <Suspense fallback={<PageLoder />}>
                    <SuperAdminPanel />
                  </Suspense>
                </SuperAdminProtect>
              }
            />
            
          </Routes>

        </BrowserRouter>
      )}
    </>
  );
}

export default App;
// This file is the main entry point for the React application.