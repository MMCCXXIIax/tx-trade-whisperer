// src/lib/saveProfile.ts

export async function saveProfile(payload: {
  id: string
  name: string
  email: string
  mode: "demo" | "broker"
}) {
  try {
    const res = await fetch("/api/save-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok || data.status !== "ok") {
      throw new Error(data.message || "Save failed")
    }

    return { success: true }
  } catch (err: any) {
    console.error("❌ Failed to save profile:", err)
    return { success: false, error: err.message }
  }
}
