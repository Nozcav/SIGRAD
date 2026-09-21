import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="flex min-h-screen animate-fadeIn flex-col items-center justify-center gap-4 bg-neutral-50 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Error 403</p>
      <h1 className="text-3xl font-semibold text-neutral-900">Acceso no autorizado</h1>
      <p className="max-w-md text-neutral-500">
        Tu rol actual no tiene permiso para ver esta pagina.
      </p>
      <Link to="/dashboard" className="font-medium text-brand-700 hover:text-brand-800">
        Volver al panel
      </Link>
    </div>
  );
};

export default Unauthorized;
