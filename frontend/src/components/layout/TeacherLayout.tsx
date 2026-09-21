import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";

const LINKS = [{ to: "/teacher", label: "Mis formularios", end: true }];

const TeacherLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar homeTo="/teacher" links={LINKS} />

      <main key={location.pathname} className="mx-auto max-w-5xl animate-fadeIn px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;
