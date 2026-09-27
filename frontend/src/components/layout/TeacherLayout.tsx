import { Outlet, useLocation } from "react-router-dom";
import { DocumentIcon } from "../icons/Icons";
import { Navbar } from "./Navbar";

const LINKS = [{ to: "/teacher", label: "Mis formularios", end: true, icon: DocumentIcon }];

const TeacherLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <Navbar homeTo="/teacher" links={LINKS} />

      <main key={location.pathname} className="mx-auto max-w-5xl animate-popIn px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;
