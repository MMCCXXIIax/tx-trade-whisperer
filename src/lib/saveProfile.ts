// src/lib/saveProfile.ts
import { safeFetch } from './api';

// Input validation for security
const validateProfilePayload = (payload: any): payload is {
  id: string
  name: string
  email: string
  mode: "demo" | "live"
} => {
  return (
    payload &&
    typeof payload.id === 'string' &&
    typeof payload.name === 'string' &&
    typeof payload.email === 'string' &&
    (payload.mode === 'demo' || payload.mode === 'live')
  );
};

export async function saveProfile(payload: {
  id: string
  name: string
  email: string
  mode: "demo" | "live"
}) {
  try {
    // Validate input for security
    if (!validateProfilePayload(payload)) {
      throw new Error("Invalid profile data provided");
    }

    // Sanitize inputs
    const sanitizedPayload = {
      id: payload.id.trim(),
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      mode: payload.mode
    };

    // Auto-generate a username if not provided
    const username =
      sanitizedPayload.name ||
      sanitizedPayload.email.split("@")[0] ||
      `user_${sanitizedPayload.id.slice(0, 8)}`;

    // Use centralized API configuration with both JSON payload and header fallback
    const data = await safeFetch<{ success?: boolean; status?: string; message?: string }>('/save-profile', {
      method: "POST",
      headers: {
        'X-User-Id': sanitizedPayload.id, // Backend fallback header
      },
      body: JSON.stringify({
        user_id: sanitizedPayload.id, // Backend expects 'user_id'
        name: sanitizedPayload.name,
        email: sanitizedPayload.email,
        mode: sanitizedPayload.mode,
        username
      }),
    });

    // Handle both success: true and status: "ok" responses
    if (!data || (!data.success && data.status !== "ok")) {
      throw new Error(data?.message || "Save failed");
    }
    
    // Backend may return skip message for missing user_id (which is OK)
    if (data.message?.includes("profile skipped")) {
      console.log("Backend profile save skipped - this is expected behavior");
    }

    return { success: true };
  } catch (err: any) {
    console.error("❌ Failed to save profile:", err);
    return { success: false, error: err.message };
  }
}
