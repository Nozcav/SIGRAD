import { Outlet, useLocation } from "react-router-dom";
import { ClockIcon, DocumentIcon, HomeIcon } from "../icons/Icons";
import { Navbar } from "./Navbar";

const LINKS = [
  { to: "/student", label: "Panel", end: true, icon: HomeIcon },
  { to: "/student/responses", label: "Mis respuestas", icon: DocumentIcon },
  { to: "/student/pending", label: "Pendientes", icon: ClockIcon },
];

const StudentLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <Navbar homeTo="/student" links={LINKS} />

      <main key={location.pathname} className="mx-auto max-w-5xl animate-popIn px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
