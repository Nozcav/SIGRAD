import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../lib/api";
import { getFormByCode } from "../../services/forms.service";
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
    <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 transition-shadow hover:shadow-md">
      <h2 className="text-lg font-semibold text-neutral-900">Ingresar codigo de formulario</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Escribe el codigo que te compartio tu docente, por ejemplo{" "}
        <span className="font-mono font-medium">SIG-7F29K3</span>.
      </p>

      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
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
