import { Outlet, useLocation } from "react-router-dom";
import { UsersIcon } from "../icons/Icons";
import { Navbar } from "./Navbar";

const LINKS = [{ to: "/admin", label: "Usuarios", end: true, icon: UsersIcon }];

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <Navbar homeTo="/admin" links={LINKS} />

      <main key={location.pathname} className="mx-auto max-w-5xl animate-popIn px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
