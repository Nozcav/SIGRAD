import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export interface NavbarLink {
  to: string;
  label: string;
  end?: boolean;
}

interface NavbarProps {
  homeTo: string;
  links: NavbarLink[];
}

const desktopNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "bg-white text-brand-700 shadow-sm"
      : "text-brand-50 hover:bg-white/10 hover:text-white"
  }`;

const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
    isActive ? "bg-white text-brand-700 shadow-sm" : "text-brand-50 hover:bg-white/10 hover:text-white"
  }`;

const getInitials = (fullName: string | undefined): string => {
  if (!fullName) {
    return "?";
  }
  const parts = fullName.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
};

export const Navbar = ({ homeTo, links }: NavbarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-10 bg-gradient-to-r from-brand-800 via-brand-700 to-brand-600 shadow-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link to={homeTo} className="flex items-center gap-3">
          <span className="flex h-10 items-center rounded-lg bg-white px-1.5 shadow-sm">
            <img src="/fet-isotype.png" alt="Logo FET" className="h-7 w-auto" />
          </span>
          <span className="text-lg font-semibold text-white">SIGRAD</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={desktopNavLinkClasses}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          {user && (
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-white/10"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-brand-900 shadow-sm ring-2 ring-white/40">
                {getInitials(user.fullName)}
              </span>
              <span className="text-sm text-brand-50">{user.fullName}</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => logout()}
            className="rounded-lg border border-white/30 bg-white/5 px-3 py-2 text-sm font-medium text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/15 hover:shadow-lg hover:shadow-black/10 active:translate-y-0 active:scale-95"
          >
            Cerrar sesion
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((previous) => !previous)}
          aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 sm:hidden"
        >
          {isMenuOpen ? (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {isMenuOpen && (
        <div className="animate-slideUp space-y-3 border-t border-white/10 px-4 py-4 sm:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={mobileNavLinkClasses}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {user && (
            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/10"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-brand-900 shadow-sm ring-2 ring-white/40">
                {getInitials(user.fullName)}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{user.fullName}</span>
                <span className="text-xs text-brand-100">Ver perfil</span>
              </div>
            </Link>
          )}

          <button
            type="button"
            onClick={() => logout()}
            className="w-full rounded-lg border border-white/30 bg-white/5 px-3 py-2.5 text-sm font-medium text-white transition-all duration-300 ease-in-out hover:bg-white/15 active:scale-95"
          >
            Cerrar sesion
          </button>
        </div>
      )}

      <div className="h-1 bg-gradient-to-r from-emerald-400 via-brand-400 to-emerald-500" />
    </header>
  );
};
