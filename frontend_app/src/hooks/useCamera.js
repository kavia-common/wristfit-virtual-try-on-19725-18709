/**
 * useCamera - a lightweight hook to handle camera access and capture.
 */
import { useCallback, useRef, useState } from "react";

// PUBLIC_INTERFACE
export function useCamera() {
  /** Hook to manage camera stream lifecycle and image capture. */
  const streamRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);

  // PUBLIC_INTERFACE
  const start = useCallback(async (videoEl, constraints) => {
    /** Starts the camera and attaches the stream to the provided video element. */
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(new Error("Camera not supported on this device/browser."));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          ...constraints,
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoEl) {
        videoEl.srcObject = stream;
        // iOS Safari specifics
        videoEl.setAttribute("playsinline", "");
        videoEl.setAttribute("muted", "");
        await videoEl.play().catch(() => {
          // Ignore autoplay restriction errors
        });
      }
      setIsActive(true);
    } catch (e) {
      setError(e);
      setIsActive(false);
    }
  }, []);

  // PUBLIC_INTERFACE
  const stop = useCallback(() => {
    /** Stops the camera stream, releasing hardware resources. */
    setIsActive(false);
    setError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  // PUBLIC_INTERFACE
  const capture = useCallback((videoEl, mimeType = "image/jpeg", quality = 0.92) => {
    /** Captures a single frame from the current video stream and returns a data URL. */
    if (!videoEl || videoEl.readyState < 2) {
      throw new Error("Video not ready to capture.");
    }
    const w = videoEl.videoWidth;
    const h = videoEl.videoHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoEl, 0, 0, w, h);
    return canvas.toDataURL(mimeType, quality);
  }, []);

  return { start, stop, capture, isActive, error };
}
