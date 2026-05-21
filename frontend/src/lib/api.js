const API = "/api";

export function getOrCreateVisitorUuid() {
  let id = localStorage.getItem("carta_visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("carta_visitor_id", id);
  }
  return id;
}

export async function logVisit() {
  try {
    await fetch(`${API}/visit`, { method: "POST" });
  } catch {
    // silent: backend down should not break the experience
  }
}

export async function enviarRespuesta(visitorUuid) {
  try {
    await fetch(`${API}/respuesta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorUuid }),
    });
  } catch {
    // silent
  }
}
