import { Outlet } from "react-router-dom";
import Page from "./components/Sidebar";
import { Toaster } from "sonner";

export default function Layout() {
  return (
    <Page>
      <div className="admin-layout flex flex-col min-h-screen h-screen overflow-hidden">
        <div className="flex-1 px-4 md:px-8 flex justify-center items-start py-4 md:py-8 overflow-auto">
          <div className="form-container">
            <Outlet />
          </div>
        </div>
      </div>
      <Toaster />
    </Page>
  );
}
