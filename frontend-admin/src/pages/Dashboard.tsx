import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../lib/api";
import KpiCard from "../components/KpiCard";

interface Stats {
  totalVisits: number;
  uniqueVisitors: number;
  totalResponses: number;
  responsesPreview: Array<{ respondedAt: string; visitorUuid: string }>;
}

interface VisitDay {
  date: string;
  count: number;
  uniqueVisitors: number;
}

export default function Dashboard() {
  const statsQuery = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api.get<Stats>("/admin/stats"),
  });

  const visitsQuery = useQuery({
    queryKey: ["admin", "visits-per-day", 7],
    queryFn: () => api.get<VisitDay[]>("/admin/metrics/visits-per-day?days=7"),
  });

  const stats = statsQuery.data;
  const visits = visitsQuery.data ?? [];
  const conversion = stats && stats.totalVisits > 0 ? (stats.totalResponses / stats.totalVisits) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Visitas" value={stats?.totalVisits ?? "-"} />
        <KpiCard label="Unicos" value={stats?.uniqueVisitors ?? "-"} />
        <KpiCard label="Respuestas" value={stats?.totalResponses ?? "-"} />
        <KpiCard label="Conversion" value={`${conversion.toFixed(1)}%`} />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="text-sm text-mist/60 uppercase tracking-wide">Visitas por dia</div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visits}>
              <XAxis dataKey="date" stroke="#cbd5f5" />
              <YAxis stroke="#cbd5f5" />
              <Tooltip
                contentStyle={{ background: "#0b0f1a", border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <Line type="monotone" dataKey="count" stroke="#ff6b35" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
