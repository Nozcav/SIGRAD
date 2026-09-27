import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../lib/api";

interface LocationState {
  from?: { pathname: string };
}

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      const state = location.state as LocationState | null;
      const from = state?.from?.pathname;
      navigate(from && from !== "/unauthorized" ? from : "/dashboard", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md animate-slideUp space-y-8 rounded-2xl border border-neutral-200 bg-white/85 p-8 shadow-xl backdrop-blur-md">
        <div className="space-y-3 text-center">
          <img src="/fet-logo-full.png" alt="Logo FET" className="mx-auto h-24 w-auto" />
          <h1 className="text-2xl font-semibold text-neutral-900">Ingresar a SIGRAD</h1>
          <p className="text-sm text-neutral-500">
            Sistema de gestion de procesos de grado - FET
          </p>
        </div>

        {error && <Alert message={error} />}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <Input
            label="Correo institucional"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            label="Contrasena"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" isLoading={isSubmitting}>
            Iniciar sesion
          </Button>
        </form>

        <p className="text-center text-sm text-neutral-500">
          Tu cuenta es creada por el administrador de SIGRAD, igual que las credenciales
          institucionales de tu universidad. Si aun no tienes acceso, contacta a la coordinacion
          de la FET.
        </p>
      </div>
    </div>
  );
};

export default Login;
