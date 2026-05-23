import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import SortableList from "../components/SortableList";

interface Cancion {
  id: string;
  url: string;
  title: string;
  artist: string;
}

export default function MediaCanciones() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [kind, setKind] = useState("playlist");
  const [file, setFile] = useState<File | null>(null);

  const playlistQuery = useQuery({
    queryKey: ["content", "playlist"],
    queryFn: () => api.get<Cancion[]>("/content/playlist"),
  });

  const fondoQuery = useQuery({
    queryKey: ["content", "fondo"],
    queryFn: () => api.get<Cancion | null>("/content/fondo"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/canciones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content", "playlist"] });
      queryClient.invalidateQueries({ queryKey: ["content", "fondo"] });
    },
  });

  const reorder = useMutation({
    mutationFn: (orderedIds: string[]) => api.patch("/admin/canciones/reorder", { orderedIds }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content", "playlist"] }),
  });

  const upload = async () => {
    if (!file || !title || !artist) return;
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("title", title);
      form.append("artist", artist);
      form.append("kind", kind);

      const res = await fetch("/api/admin/canciones", {
        method: "POST",
        credentials: "include",
        body: form,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      setFile(null);
      setTitle("");
      setArtist("");
      setKind("playlist");
      queryClient.invalidateQueries({ queryKey: ["content", "playlist"] });
      queryClient.invalidateQueries({ queryKey: ["content", "fondo"] });
    } catch {
      // ignore
    }
  };

  const playlist = playlistQuery.data ?? [];
  const fondo = fondoQuery.data;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-sm text-mist/60 uppercase tracking-wide mb-3">Subir cancion</div>
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titulo"
            className="rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-mist"
          />
          <input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artista"
            className="rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-mist"
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-mist"
          >
            <option value="playlist">Playlist</option>
            <option value="fondo">Fondo</option>
          </select>
          <input
            type="file"
            accept="audio/mpeg"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-mist/80"
          />
        </div>
        <button
          onClick={upload}
          className="mt-4 rounded-lg bg-ember px-4 py-2 text-ink font-semibold"
        >
          Subir
        </button>
      </div>

      {fondo && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-wide text-mist/60 mb-2">Fondo</div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-mist font-semibold">{fondo.title}</div>
              <div className="text-xs text-mist/60">{fondo.artist}</div>
            </div>
            <audio controls src={fondo.url} className="w-full md:w-72" />
            <button
              onClick={() => remove.mutate(fondo.id)}
              className="text-xs uppercase tracking-wide text-ember"
            >
              Borrar
            </button>
          </div>
        </div>
      )}

      <SortableList
        items={playlist}
        onReorder={(ids) => reorder.mutate(ids)}
        renderItem={(song) => (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-mist font-semibold">{song.title}</div>
                <div className="text-xs text-mist/60">{song.artist}</div>
              </div>
              <audio controls src={song.url} className="w-full md:w-72" />
              <button
                onClick={() => remove.mutate(song.id)}
                className="text-xs uppercase tracking-wide text-ember"
              >
                Borrar
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
}
