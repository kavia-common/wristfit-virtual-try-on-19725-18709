/**
 * API client for WristFit frontend.
 * Provides methods to communicate with the backend hand-detection API.
 */

// PUBLIC_INTERFACE
export function getApiBase() {
  /** Returns the configured API base URL (from REACT_APP_API_BASE) or empty string for same-origin. */
  return process.env.REACT_APP_API_BASE || "";
}

// PUBLIC_INTERFACE
export async function handDetect(imageBase64, preferExternal = true, timeoutMs = 25000) {
  /**
   * Calls the /api/hand-detect endpoint with the provided base64 image.
   * Returns: { landmarks, segmentation_mask, confidence, provider, width, height }
   */
  if (!imageBase64) {
    throw new Error("No image provided");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${getApiBase()}/api/hand-detect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        image_base64: imageBase64,
        prefer_external: preferExternal,
      }),
    });

    if (!res.ok) {
      const detail = await safeParseJson(res);
      const message = detail?.detail || `Detection failed (${res.status})`;
      throw new Error(message);
    }

    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function safeParseJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
