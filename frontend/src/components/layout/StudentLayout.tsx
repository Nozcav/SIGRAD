import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";

const LINKS = [
  { to: "/student", label: "Panel", end: true },
  { to: "/student/responses", label: "Mis respuestas" },
  { to: "/student/pending", label: "Pendientes" },
];

const StudentLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar homeTo="/student" links={LINKS} />

      <main key={location.pathname} className="mx-auto max-w-5xl animate-fadeIn px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
