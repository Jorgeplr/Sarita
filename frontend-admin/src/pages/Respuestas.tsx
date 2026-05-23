import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface Stats {
  responsesPreview: Array<{
    respondedAt: string;
    visitorUuid: string;
    device: string | null;
    browser: string | null;
    os: string | null;
  }>;
}

export default function Respuestas() {
  const query = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api.get<Stats>("/admin/stats"),
  });

  const rows = query.data?.responsesPreview ?? [];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="text-sm uppercase tracking-wide text-mist/60 mb-4">Ultimas respuestas</div>
      <div className="space-y-3 text-sm">
        {rows.length === 0 && <div className="text-mist/60">Sin respuestas todavia.</div>}
        {rows.map((row) => (
          <div key={row.visitorUuid} className="rounded-lg border border-white/10 p-3">
            <div className="text-mist">{row.respondedAt}</div>
            <div className="text-mist/60 text-xs">{row.visitorUuid}</div>
            <div className="text-mist/60 text-xs">
              {row.device} / {row.browser} / {row.os}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
