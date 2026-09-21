import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";

const LINKS = [{ to: "/admin", label: "Usuarios", end: true }];

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar homeTo="/admin" links={LINKS} />

      <main key={location.pathname} className="mx-auto max-w-5xl animate-fadeIn px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
