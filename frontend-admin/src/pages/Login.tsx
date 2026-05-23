import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

type LoginForm = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: LoginForm) => {
    try {
      await login.mutateAsync(values);
      navigate("/dashboard");
    } catch {
      // handled by login.isError
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-3xl text-mist mb-2">Admin Panel</h1>
        <p className="text-sm text-mist/60 mb-6">Acceso privado para gestionar la carta.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-mist/60">Usuario</label>
            <input
              {...register("username")}
              className="mt-2 w-full rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-mist"
            />
            {errors.username && (
              <div className="text-xs text-ember mt-1">Usuario requerido</div>
            )}
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-mist/60">Password</label>
            <input
              type="password"
              {...register("password")}
              className="mt-2 w-full rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-mist"
            />
            {errors.password && (
              <div className="text-xs text-ember mt-1">Password requerido</div>
            )}
          </div>

          {login.isError && (
            <div className="text-xs text-ember">Credenciales invalidas.</div>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full rounded-lg bg-ember px-4 py-2 font-semibold text-ink hover:bg-emberDark disabled:opacity-60"
          >
            {login.isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
