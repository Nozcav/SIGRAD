import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../lib/api";
import { getFormByCode } from "../../services/forms.service";
import { KeyIcon } from "../icons/Icons";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export const FormCodeEntry = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setError("Ingresa un codigo de formulario");
      return;
    }

    setIsChecking(true);

    try {
      await getFormByCode(normalizedCode);
      navigate(`/student/forms/${normalizedCode}`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-200/70 bg-gradient-to-br from-brand-50/80 via-emerald-50/70 to-brand-100/80 p-6 shadow-lg shadow-brand-500/10 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/20">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 animate-meshMove rounded-full bg-brand-400/20 blur-2xl" />

      <h2 className="relative flex items-center gap-2 text-lg font-semibold text-neutral-900">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-[0_0_10px_1px_rgba(16,185,129,0.35)]">
          <KeyIcon className="h-5 w-5" />
        </span>
        Ingresar codigo de formulario
      </h2>
      <p className="relative mt-1 text-sm text-neutral-600">
        Escribe el codigo que te compartio tu docente, por ejemplo{" "}
        <span className="font-mono font-medium text-brand-700">SIG-7F29K3</span>.
      </p>

      <form
        className="relative mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="flex-1">
          <Input
            label="Codigo de acceso"
            name="code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="SIG-XXXXXX"
            className="font-mono uppercase tracking-wide"
          />
        </div>
        <Button type="submit" isLoading={isChecking} className="sm:w-auto sm:px-8">
          Buscar formulario
        </Button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
};
