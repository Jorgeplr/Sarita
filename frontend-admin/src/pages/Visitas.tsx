import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { api } from "../lib/api";
import DataTable from "../components/DataTable";

interface VisitRow {
  id: string;
  visitedAt: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  ipHashPrefix: string;
}

interface VisitsResponse {
  total: number;
  limit: number;
  offset: number;
  items: VisitRow[];
}

export default function Visitas() {
  const [pageIndex, setPageIndex] = useState(0);
  const [device, setDevice] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const pageSize = 50;

  const query = useQuery({
    queryKey: ["admin", "visits", pageIndex, device, from, to],
    queryFn: () => {
      const params = new URLSearchParams({
        limit: String(pageSize),
        offset: String(pageIndex * pageSize),
      });
      if (device !== "all") params.set("device", device);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      return api.get<VisitsResponse>(`/admin/visits?${params.toString()}`);
    },
  });

  const data = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const columns = useMemo<ColumnDef<VisitRow>[]>(
    () => [
      { header: "Fecha", accessorKey: "visitedAt" },
      { header: "Device", accessorKey: "device" },
      { header: "Browser", accessorKey: "browser" },
      { header: "OS", accessorKey: "os" },
      { header: "IP", accessorKey: "ipHashPrefix" },
    ],
    []
  );

  const exportCsv = () => {
    const header = ["fecha", "device", "browser", "os", "ip"];
    const rows = data.map((row) => [row.visitedAt, row.device, row.browser, row.os, row.ipHashPrefix]);
    const content = [header, ...rows]
      .map((r) => r.map((v) => `"${v ?? ""}"`).join(","))
      .join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "visitas.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={device}
          onChange={(e) => setDevice(e.target.value)}
          className="rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-sm text-mist"
        >
          <option value="all">Todos</option>
          <option value="mobile">Mobile</option>
          <option value="desktop">Desktop</option>
          <option value="tablet">Tablet</option>
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-sm text-mist"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-sm text-mist"
        />
        <button
          onClick={exportCsv}
          className="rounded-lg border border-ember px-3 py-2 text-xs uppercase tracking-wide text-ember hover:bg-ember hover:text-ink"
        >
          Exportar CSV
        </button>
      </div>

      <DataTable
        data={data}
        columns={columns}
        pageIndex={pageIndex}
        pageSize={pageSize}
        pageCount={pageCount}
        onPageChange={(next) => setPageIndex(Math.max(0, Math.min(pageCount - 1, next)))}
      />
    </div>
  );
}
