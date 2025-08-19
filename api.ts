// api.ts
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export async function saveProfile(payload: unknown) {
  const res = await fetch(`${API_BASE}/save-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || data?.success !== true) {
    throw new Error(data?.error || "Save failed");
  }
  return data;
}
