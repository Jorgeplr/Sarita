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

      <SortableList
        items={fotos}
        onReorder={(ids) => reorder.mutate(ids)}
        renderItem={(foto) => (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <img
              src={foto.thumbUrl || foto.url}
              alt="Foto"
              className="w-full rounded-xl mb-3"
            />
            <input
              defaultValue={foto.caption ?? ""}
              onBlur={(e) => update.mutate({ id: foto.id, caption: e.target.value })}
              placeholder="Caption"
              className="w-full rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-sm text-mist"
            />
            <button
              onClick={() => remove.mutate(foto.id)}
              className="mt-3 text-xs uppercase tracking-wide text-ember"
            >
              Borrar
            </button>
          </div>
        )}
      />
    </div>
  );
}
