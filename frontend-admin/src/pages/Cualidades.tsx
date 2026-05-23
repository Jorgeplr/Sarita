import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SortableList from "../components/SortableList";
import { api } from "../lib/api";

interface Cualidad {
  id: string;
  icon: string;
  text: string;
}

export default function Cualidades() {
  const queryClient = useQueryClient();
  const [icon, setIcon] = useState("");
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editIcon, setEditIcon] = useState("");
  const [editText, setEditText] = useState("");

  const query = useQuery({
    queryKey: ["content", "cualidades"],
    queryFn: () => api.get<Cualidad[]>("/content/cualidades"),
  });

  const create = useMutation({
    mutationFn: (payload: { icon: string; text: string }) => api.post("/admin/cualidades", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content", "cualidades"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/cualidades/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content", "cualidades"] }),
  });

  const update = useMutation({
    mutationFn: (payload: { id: string; icon: string; text: string }) =>
      api.patch(`/admin/cualidades/${payload.id}`, { icon: payload.icon, text: payload.text }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content", "cualidades"] }),
  });

  const reorder = useMutation({
    mutationFn: (orderedIds: string[]) => api.patch("/admin/cualidades/reorder", { orderedIds }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content", "cualidades"] }),
  });

  const items = query.data ?? [];

  const handleCreate = async () => {
    if (!icon || !text) return;
    await create.mutateAsync({ icon, text });
    setIcon("");
    setText("");
  };

  const startEdit = (item: Cualidad) => {
    setEditingId(item.id);
    setEditIcon(item.icon);
    setEditText(item.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditIcon("");
    setEditText("");
  };

  const saveEdit = async () => {
    if (!editingId || !editIcon || !editText) return;
    await update.mutateAsync({ id: editingId, icon: editIcon, text: editText });
    cancelEdit();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="text-sm text-mist/60 uppercase tracking-wide mb-3">Nueva cualidad</div>
        <div className="flex flex-wrap gap-3">
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Emoji"
            className="w-24 rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-mist"
          />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Texto"
            className="flex-1 min-w-[220px] rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-mist"
          />
          <button
            onClick={handleCreate}
            className="rounded-lg bg-ember px-4 py-2 text-ink font-semibold"
          >
            Guardar
          </button>
        </div>
      </div>

      <SortableList
        items={items}
        onReorder={(ids) => reorder.mutate(ids)}
        renderItem={(item) => (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur flex items-center justify-between">
            {editingId === item.id ? (
              <div className="flex flex-1 flex-wrap gap-3 items-center">
                <input
                  value={editIcon}
                  onChange={(e) => setEditIcon(e.target.value)}
                  className="w-20 rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-mist"
                />
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 min-w-[220px] rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-mist"
                />
                <button
                  onClick={saveEdit}
                  className="text-xs uppercase tracking-wide text-ember"
                >
                  Guardar
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-xs uppercase tracking-wide text-mist/60"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{item.icon}</div>
                  <div className="text-mist">{item.text}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-xs uppercase tracking-wide text-mist/70"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => remove.mutate(item.id)}
                    className="text-xs uppercase tracking-wide text-ember"
                  >
                    Borrar
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      />
    </div>
  );
}
