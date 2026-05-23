import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import UploadDropzone from "../components/UploadDropzone";
import SortableList from "../components/SortableList";
import { api } from "../lib/api";

interface Foto {
  id: string;
  url: string;
  thumbUrl: string;
  caption: string | null;
}

export default function MediaFotos() {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<Foto | null>(null);

  const query = useQuery({
    queryKey: ["content", "fotos"],
    queryFn: () => api.get<Foto[]>("/content/fotos"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/fotos/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content", "fotos"] }),
  });

  const update = useMutation({
    mutationFn: ({ id, caption }: { id: string; caption: string }) =>
      api.patch(`/admin/fotos/${id}`, { caption }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content", "fotos"] }),
  });

  const reorder = useMutation({
    mutationFn: (orderedIds: string[]) => api.patch("/admin/fotos/reorder", { orderedIds }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content", "fotos"] }),
  });

  const fotos = query.data ?? [];

  return (
    <div className="space-y-6">
      <UploadDropzone
        endpoint="/api/admin/fotos"
        accept="image/*"
        multiple
        onUploaded={() => queryClient.invalidateQueries({ queryKey: ["content", "fotos"] })}
      />

      {fotos.length === 0 && !query.isLoading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-mist/60">
          No hay fotos todavia. Subelas arriba.
        </div>
      )}

      <SortableList
        layout="grid"
        items={fotos}
        onReorder={(ids) => reorder.mutate(ids)}
        renderItem={(foto) => (
          <div className="rounded-xl border border-white/10 bg-white/5 p-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setPreview(foto)}
              className="aspect-square overflow-hidden rounded-lg bg-ink/40 group"
              aria-label="Ver foto en grande"
            >
              <img
                src={foto.thumbUrl || foto.url}
                alt={foto.caption ?? "Foto"}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </button>
            <input
              defaultValue={foto.caption ?? ""}
              onBlur={(e) => {
                if (e.target.value !== (foto.caption ?? "")) {
                  update.mutate({ id: foto.id, caption: e.target.value });
                }
              }}
              placeholder="Caption"
              className="w-full rounded-md border border-white/10 bg-ink/60 px-2 py-1 text-xs text-mist placeholder:text-mist/40"
            />
            <button
              onClick={() => {
                if (confirm("Borrar esta foto?")) remove.mutate(foto.id);
              }}
              disabled={remove.isPending}
              className="text-[10px] uppercase tracking-wider text-ember hover:text-ember/80 self-start disabled:opacity-50"
            >
              Borrar
            </button>
          </div>
        )}
      />

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 backdrop-blur p-4"
          onClick={() => setPreview(null)}
        >
          <img
            src={preview.url}
            alt={preview.caption ?? "Foto"}
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1 text-mist text-sm"
            aria-label="Cerrar preview"
          >
            ✕ Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
