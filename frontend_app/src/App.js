import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import CameraView from "./components/CameraView";
import GallerySheet from "./components/GallerySheet";
import WatchPreview from "./components/WatchPreview";
import { WATCHES } from "./assets/watches";
import { handDetect } from "./api/client";

// PUBLIC_INTERFACE
function App() {
  /** WristFit: Mobile-first camera, detection, and preview flow. */
  const [theme] = useState("light"); // Could be extended to system/auto
  const [step, setStep] = useState("camera"); // 'camera' | 'preview'
  const [galleryOpen, setGalleryOpen] = useState(false);

  const [selectedWatch, setSelectedWatch] = useState(WATCHES[0]);
  const [captured, setCaptured] = useState(null);
  const [detection, setDetection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [composeResult, setComposeResult] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const onCapture = async (dataUrl) => {
    setCaptured(dataUrl);
    setStep("preview");
    setLoading(true);
    try {
      const result = await handDetect(dataUrl, true);
      setDetection(result);
    } catch (e) {
      console.warn("Detection failed, interactive manual placement enabled.", e);
      setDetection(null);
    } finally {
      setLoading(false);
    }
  };

  const onUploadSelected = (dataUrl) => {
    onCapture(dataUrl);
  };

  const onBackToCamera = () => {
    setCaptured(null);
    setDetection(null);
    setComposeResult(null);
    setStep("camera");
  };

  const onComposed = (pngDataUrl) => {
    setComposeResult(pngDataUrl);
    // Let user share/save – could show a toast or store history
  };

  const headerActions = useMemo(() => {
    if (step === "camera") {
      return null;
    }
    return (
      <div className="top-actions">
        <button className="btn ghost" onClick={() => setGalleryOpen(true)}>⌚ Switch</button>
      </div>
    );
  }, [step]);

  return (
    <div className="App">
      {step === "camera" && (
        <>
          <CameraView
            onCapture={onCapture}
            onUploadSelected={onUploadSelected}
            onToggleGallery={() => setGalleryOpen((v) => !v)}
          />
          <GallerySheet
            watches={WATCHES}
            isOpen={galleryOpen}
            onClose={() => setGalleryOpen(false)}
            onSelect={(w) => {
              setSelectedWatch(w);
              setGalleryOpen(false);
            }}
          />
        </>
      )}

      {step === "preview" && captured && (
        <>
          {loading && <div className="loading-overlay" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", top: 66, zIndex: 1000 }}>Detecting hand…</div>}
          <WatchPreview
            watch={selectedWatch}
            baseImageSrc={captured}
            detection={detection}
            onBack={onBackToCamera}
            onComposed={onComposed}
          />
          <GallerySheet
            watches={WATCHES}
            isOpen={galleryOpen}
            onClose={() => setGalleryOpen(false)}
            onSelect={(w) => {
              setSelectedWatch(w);
              setGalleryOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}

export default App;
