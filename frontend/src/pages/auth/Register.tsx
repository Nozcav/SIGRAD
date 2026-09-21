import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../lib/api";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ fullName, email, documentId, password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md animate-slideUp space-y-8 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="space-y-3 text-center">
          <img src="/fet-logo-full.png" alt="Logo FET" className="mx-auto h-24 w-auto" />
          <h1 className="text-2xl font-semibold text-neutral-900">Crear cuenta en SIGRAD</h1>
          <p className="text-sm text-neutral-500">
            El registro crea una cuenta de estudiante. El rol de docente es asignado por un
            administrador.
          </p>
        </div>

        {error && <Alert message={error} />}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <Input
            label="Nombre completo"
            type="text"
            name="fullName"
            autoComplete="name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
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
            label="Documento de identidad"
            type="text"
            name="documentId"
            autoComplete="off"
            required
            value={documentId}
            onChange={(event) => setDocumentId(event.target.value)}
          />
          <Input
            label="Contrasena"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Input
            label="Confirmar contrasena"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          <Button type="submit" isLoading={isSubmitting}>
            Crear cuenta
          </Button>
        </form>

        <p className="text-center text-sm text-neutral-500">
          Ya tienes una cuenta?{" "}
          <Link to="/login" className="font-medium text-brand-700 hover:text-brand-800">
            Inicia sesion
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
