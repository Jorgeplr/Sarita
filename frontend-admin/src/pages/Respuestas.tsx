import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface ResponseRow {
  respondedAt: string;
  visitorUuid: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  opinion: string | null;
  teEncanto: boolean | null;
  salida: "si" | "tal_vez" | "no" | null;
}

interface Stats {
  responsesPreview: ResponseRow[];
  totalResponses?: number;
}

const SALIDA_LABEL: Record<string, string> = {
  si: "Si quiere salida",
  tal_vez: "Tal vez",
  no: "Aun no",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function Chip({ children, tone }: { children: React.ReactNode; tone: "green" | "amber" | "rose" | "mist" }) {
  const palette = {
    green: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
    amber: "bg-amber-400/15 text-amber-300 border-amber-400/30",
    rose: "bg-rose-400/15 text-rose-300 border-rose-400/30",
    mist: "bg-white/10 text-mist/70 border-white/15",
  }[tone];
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${palette}`}>
      {children}
    </span>
  );
}

export default function Respuestas() {
  const query = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api.get<Stats>("/admin/stats"),
  });

  const rows = query.data?.responsesPreview ?? [];
  const total = query.data?.totalResponses ?? rows.length;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm uppercase tracking-wide text-mist/60">Ultimas respuestas</div>
        <div className="text-xs text-mist/40">Total: {total}</div>
      </div>

      {query.isLoading && (
        <div className="text-mist/60 text-sm">Cargando...</div>
      )}

      {!query.isLoading && rows.length === 0 && (
        <div className="text-mist/60 text-sm">Sin respuestas todavia.</div>
      )}

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.visitorUuid}
            className="rounded-xl border border-white/10 bg-ink/40 p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-mist font-medium">{formatDate(row.respondedAt)}</div>
              {row.teEncanto === true && <Chip tone="green">Le encanto</Chip>}
              {row.teEncanto === false && <Chip tone="mist">No tanto</Chip>}
              {row.salida === "si" && <Chip tone="green">Quiere salida</Chip>}
              {row.salida === "tal_vez" && <Chip tone="amber">Tal vez</Chip>}
              {row.salida === "no" && <Chip tone="rose">Aun no</Chip>}
            </div>

            {row.opinion && (
              <div className="rounded-lg border-l-4 border-emerald-400/40 bg-emerald-400/5 px-3 py-2 text-sm text-mist whitespace-pre-wrap">
                {row.opinion}
              </div>
            )}

            <div className="text-xs text-mist/40 flex flex-wrap gap-3">
              <span title={row.visitorUuid} className="truncate max-w-[160px]">
                ID: {row.visitorUuid.slice(0, 8)}…
              </span>
              <span>{row.device ?? "?"}</span>
              <span>{row.browser ?? "?"}</span>
              <span>{row.os ?? "?"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
