// src/lib/saveProfile.ts

export async function saveProfile(payload: {
  id: string
  name: string
  email: string
  mode: "demo" | "live"
}) {
  try {
    // Auto-generate a username if not provided
    const username =
      payload.name?.trim() ||
      payload.email?.split("@")[0] ||
      `user_${payload.id.slice(0, 8)}`;

    const res = await fetch("/api/save-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        username // <-- now included
      }),
    });

    const data = await res.json();

    if (!res.ok || data.status !== "ok") {
      throw new Error(data.message || "Save failed");
    }

    return { success: true };
  } catch (err: any) {
    console.error("❌ Failed to save profile:", err);
    return { success: false, error: err.message };
  }
}
