import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export default function Configuracion() {
  const { logout } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    await api.post("/auth/change-password", values);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-sm uppercase tracking-wide text-mist/60 mb-4">Cambiar password</div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs text-mist/60">Password actual</label>
            <input
              type="password"
              {...register("currentPassword")}
              className="mt-2 w-full rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-mist"
            />
            {errors.currentPassword && (
              <div className="text-xs text-ember mt-1">Requerido</div>
            )}
          </div>
          <div>
            <label className="block text-xs text-mist/60">Nuevo password</label>
            <input
              type="password"
              {...register("newPassword")}
              className="mt-2 w-full rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-mist"
            />
            {errors.newPassword && (
              <div className="text-xs text-ember mt-1">Minimo 8 caracteres</div>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-ember px-4 py-2 text-ink font-semibold"
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </div>

      <button
        onClick={() => logout.mutate()}
        className="rounded-lg border border-ember px-4 py-2 text-ember hover:bg-ember hover:text-ink"
      >
        Logout
      </button>
    </div>
  );
}
