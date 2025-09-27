import React, { useEffect, useRef, useState } from "react";
import { useCamera } from "../hooks/useCamera";

/**
 * CameraView - Full-viewport camera with a wrist guide overlay and capture button.
 * Props:
 *  - onCapture(dataUrl: string)
 *  - onUploadSelected(dataUrl: string)
 *  - onToggleGallery(): void (optional)
 */

// PUBLIC_INTERFACE
export default function CameraView({ onCapture, onUploadSelected, onToggleGallery }) {
  /** Camera screen with guide overlay and capture controls. */
  const videoRef = useRef(null);
  const fileRef = useRef(null);
  const { start, stop, capture, isActive, error } = useCamera();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await start(videoRef.current);
      if (!cancelled) setLoading(false);
    })();

    return () => {
      stop();
      cancelled = true;
    };
  }, [start, stop]);

  const handleCapture = () => {
    try {
      const dataUrl = capture(videoRef.current);
      stop();
      onCapture?.(dataUrl);
    } catch (e) {
      console.error(e);
      alert("Unable to capture from camera. You can upload a photo instead.");
    }
  };

  const handleUploadClick = () => fileRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUploadSelected?.(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="camera-screen">
      <div className="top-bar">
        <div className="brand">
          <span className="logo-dot" />
          WristFit
        </div>
        <div className="top-actions">
          <button className="btn secondary" onClick={onToggleGallery} aria-label="Open watch gallery">
            ⌚ Watch
          </button>
          <button className="btn ghost" onClick={handleUploadClick} aria-label="Upload image">
            ↑ Upload
          </button>
        </div>
      </div>

      <div className="camera-container">
        {error && (
          <div className="error-banner">
            Camera access failed: {String(error.message || error)}. You can upload a photo instead.
          </div>
        )}
        <video ref={videoRef} className="camera-video" playsInline muted autoPlay />
        <div className="wrist-guide">
          <div className="guide-label">Align wrist here</div>
          <div className="guide-bracket left" />
          <div className="guide-bracket right" />
        </div>
        {loading && <div className="loading-overlay">Starting camera…</div>}
      </div>

      <div className="bottom-bar">
        <button className="capture-btn" onClick={handleCapture} aria-label="Capture photo">
          <span className="capture-ring" />
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
