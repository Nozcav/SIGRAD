import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen animate-fadeIn flex-col items-center justify-center gap-4 bg-neutral-50 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Error 404</p>
      <h1 className="text-3xl font-semibold text-neutral-900">Pagina no encontrada</h1>
      <p className="max-w-md text-neutral-500">La pagina que buscas no existe o fue movida.</p>
      <Link to="/dashboard" className="font-medium text-brand-700 hover:text-brand-800">
        Volver al panel
      </Link>
    </div>
  );
};

export default NotFound;
