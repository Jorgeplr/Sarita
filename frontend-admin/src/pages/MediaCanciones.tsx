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

type CancionKind = "playlist" | "fondo";

const MAX_BYTES = 25 * 1024 * 1024;

const ACCEPTED_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
]);

const ERROR_MESSAGES: Record<string, string> = {
  MISSING_FILE: "Selecciona un archivo de audio.",
  INVALID_FILE: "Formato no valido. Solo se permiten archivos MP3, M4A o MP4 (audio).",
  FILE_TOO_LARGE: "El archivo supera el limite de 25 MB.",
  UNAUTHED: "Sesion expirada. Vuelve a iniciar sesion.",
};

function describeError(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const obj = payload as { code?: string; error?: string };
    if (obj.code && ERROR_MESSAGES[obj.code]) return ERROR_MESSAGES[obj.code];
    if (obj.error) return obj.error;
  }
  return fallback;
}

export default function MediaCanciones() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [kind, setKind] = useState<CancionKind>("playlist");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    mutationFn: (orderedIds: string[]) =>
      api.patch("/admin/canciones/reorder", { orderedIds }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content", "playlist"] }),
  });

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setArtist("");
    setKind("playlist");
  };

  const validate = (): string | null => {
    if (!title.trim()) return "Introduce el titulo de la cancion.";
    if (!artist.trim()) return "Introduce el artista.";
    if (!file) return "Selecciona un archivo de audio (MP3, M4A o MP4).";
    if (file.size > MAX_BYTES) return ERROR_MESSAGES.FILE_TOO_LARGE;
    if (file.type && !ACCEPTED_MIME_TYPES.has(file.type)) {
      return ERROR_MESSAGES.INVALID_FILE;
    }
    return null;
  };

  const upload = () => {
    setError(null);
    setSuccess(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    setProgress(0);

    const form = new FormData();
    form.append("file", file as File);
    form.append("title", title.trim());
    form.append("artist", artist.trim());
    form.append("kind", kind);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/canciones");
    xhr.withCredentials = true;
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      setProgress(0);
      if (xhr.status >= 200 && xhr.status < 300) {
        setSuccess("Cancion subida correctamente.");
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["content", "playlist"] });
        queryClient.invalidateQueries({ queryKey: ["content", "fondo"] });
        return;
      }
      setError(describeError(xhr.response, `Error ${xhr.status} al subir la cancion.`));
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setProgress(0);
      setError("Error de red. Comprueba tu conexion e intenta de nuevo.");
    };

    xhr.send(form);
  };

  const playlist = playlistQuery.data ?? [];
  const fondo = fondoQuery.data;
  const canSubmit = !isUploading && !!file && !!title.trim() && !!artist.trim();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-sm text-mist/60 uppercase tracking-wide mb-3">Subir cancion</div>
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titulo"
            disabled={isUploading}
            className="rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-mist disabled:opacity-50"
          />
          <input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artista"
            disabled={isUploading}
            className="rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-mist disabled:opacity-50"
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as CancionKind)}
            disabled={isUploading}
            className="rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-mist disabled:opacity-50"
          >
            <option value="playlist">Playlist</option>
            <option value="fondo">Fondo</option>
          </select>
          <input
            type="file"
            accept="audio/mpeg,audio/mp4,audio/aac,.mp3,.m4a,.mp4,.aac"
            disabled={isUploading}
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setError(null);
              setSuccess(null);
            }}
            className="text-sm text-mist/80 disabled:opacity-50"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={upload}
            disabled={!canSubmit}
            className="rounded-lg bg-ember px-4 py-2 text-ink font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? `Subiendo... ${progress}%` : "Subir"}
          </button>
          {kind === "fondo" && (
            <span className="text-xs text-mist/60">
              Reemplazara el fondo actual si existe.
            </span>
          )}
        </div>

        {isUploading && (
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-ember transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-3 rounded-lg border border-ember/40 bg-ember/10 px-3 py-2 text-sm text-ember"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-3 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300"
          >
            {success}
          </div>
        )}
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
              disabled={remove.isPending}
              className="text-xs uppercase tracking-wide text-ember disabled:opacity-50"
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
                disabled={remove.isPending}
                className="text-xs uppercase tracking-wide text-ember disabled:opacity-50"
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
