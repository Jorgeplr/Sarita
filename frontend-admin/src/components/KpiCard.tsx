interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export default function KpiCard({ label, value, hint }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="text-xs uppercase tracking-wide text-mist/60">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-mist">{value}</div>
      {hint && <div className="mt-1 text-xs text-mist/50">{hint}</div>}
    </div>
  );
}
