export default function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center text-mist">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 rounded-full bg-ember animate-pulse" />
        <div className="text-sm tracking-wide uppercase">Cargando</div>
      </div>
    </div>
  );
}
