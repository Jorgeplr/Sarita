import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/visitas", label: "Visitas" },
  { to: "/respuestas", label: "Respuestas" },
  { to: "/cualidades", label: "Cualidades" },
  { to: "/media/fotos", label: "Fotos" },
  { to: "/media/canciones", label: "Canciones" },
  { to: "/configuracion", label: "Configuracion" },
];

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded-lg px-3 py-2 text-sm uppercase tracking-wide ${
          isActive ? "bg-ember text-ink shadow-glow" : "text-mist/80 hover:text-mist"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-60 flex-col border-r border-white/10 bg-ink/80 backdrop-blur p-6">
        <div className="text-lg font-semibold text-mist mb-6">Carta Genesis</div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} />
          ))}
        </nav>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 bg-ink/80 backdrop-blur md:hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold text-mist">Carta Genesis</div>
              <button
                onClick={() => setOpen(false)}
                className="text-mist/80 hover:text-mist"
              >
                Cerrar
              </button>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavItem key={item.to} to={item.to} label={item.label} />
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-ink/70 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-mist/80 hover:text-mist"
              onClick={() => setOpen(true)}
            >
              Menu
            </button>
            <div className="text-sm text-mist/70">Admin Panel</div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-mist/80">{user?.username}</span>
            <button
              onClick={() => logout.mutate()}
              className="rounded-full border border-ember px-3 py-1 text-ember hover:bg-ember hover:text-ink"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
