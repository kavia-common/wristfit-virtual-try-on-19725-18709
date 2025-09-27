import React, { useEffect, useMemo, useRef, useState } from "react";
import { computeWristMetrics, toPxPoint } from "../utils/geometry";
import { composeImageWithWatch } from "../utils/canvas";

/**
 * WatchPreview - interactive overlay view to adjust watch placement and size.
 * Props:
 *  - baseImageSrc: string (captured/uploaded image data URL)
 *  - detection: {landmarks,width,height,segmentation_mask}
 *  - watch: {name, diameterMm, assetPx, svgDataUri}
 *  - onBack(): void
 *  - onComposed(dataUrl: string): void
 */

// PUBLIC_INTERFACE
export default function WatchPreview({ baseImageSrc, detection, watch, onBack, onComposed }) {
  /** Interactive preview for fine-tuning the rendered watch before sharing/saving. */
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [userWristWidthMm, setUserWristWidthMm] = useState(58);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [angleAdjust, setAngleAdjust] = useState(0);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (imgRef.current) {
        setContainerSize({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight });
      }
    });
    if (imgRef.current) ro.observe(imgRef.current);
    return () => ro.disconnect();
  }, []);

  const wrist = useMemo(() => {
    if (!detection?.landmarks?.length || !detection?.width || !detection?.height) return null;
    return computeWristMetrics(detection.landmarks, detection.width, detection.height);
  }, [detection]);

  const imgDims = useMemo(() => {
    // We'll render with natural image pixels
    const tempImg = new Image();
    tempImg.src = baseImageSrc;
    const w = tempImg.width || detection?.width || 0;
    const h = tempImg.height || detection?.height || 0;
    return { w, h };
  }, [baseImageSrc, detection]);

  const mmPerPx = useMemo(() => {
    if (!wrist || !wrist.widthPx) return watch.diameterMm / (watch.assetPx || 1000); // fallback
    return userWristWidthMm / wrist.widthPx;
  }, [wrist, userWristWidthMm, watch]);

  const targetDiameterPx = useMemo(() => {
    return Math.max(8, Math.round(watch.diameterMm / mmPerPx));
  }, [watch, mmPerPx]);

  const anchor = useMemo(() => {
    if (wrist?.center) return { x: wrist.center.x + offset.x, y: wrist.center.y + offset.y };
    // Fallback to center of image
    const w = detection?.width || imgDims.w || 0;
    const h = detection?.height || imgDims.h || 0;
    return { x: w / 2 + offset.x, y: h / 2 + offset.y };
  }, [wrist, offset, detection, imgDims]);

  const angleRad = useMemo(() => (wrist?.angleRad || 0) + (angleAdjust * Math.PI) / 180, [wrist, angleAdjust]);

  // Dragging
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const onPointerDown = (e) => {
    dragging.current = true;
    last.current = pointFromEvent(e);
    e.preventDefault();
  };
  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const p = pointFromEvent(e);
    const dx = p.x - last.current.x;
    const dy = p.y - last.current.y;
    last.current = p;
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  function pointFromEvent(e) {
    const rect = containerRef.current?.getBoundingClientRect();
    const x = e.clientX - (rect?.left || 0);
    const y = e.clientY - (rect?.top || 0);
    // Map to image pixel coords based on scale of rendered element
    if (!rect || !imgDims.w || !imgDims.h) return { x, y };
    const scaleX = imgDims.w / rect.width;
    const scaleY = imgDims.h / rect.height;
    return { x: x * scaleX, y: y * scaleY };
  }

  const doCompose = async () => {
    try {
      const png = await composeImageWithWatch({
        baseImageSrc,
        watchSvgDataUri: watch.svgDataUri,
        anchor,
        angleRad,
        targetDiameterPx,
        maskDataUri: detection?.segmentation_mask || null,
      });
      onComposed?.(png);
    } catch (e) {
      console.error(e);
      alert("Failed to render the final image. Please try again.");
    }
  };

  const shareOrDownload = async () => {
    const png = await composeImageWithWatch({
      baseImageSrc,
      watchSvgDataUri: watch.svgDataUri,
      anchor,
      angleRad,
      targetDiameterPx,
      maskDataUri: detection?.segmentation_mask || null,
    });

    try {
      const blob = await (await fetch(png)).blob();
      if (navigator.canShare && navigator.canShare({ files: [new File([blob], "wristfit.png", { type: "image/png" })] })) {
        await navigator.share({
          files: [new File([blob], "wristfit.png", { type: "image/png" })],
          title: "WristFit",
          text: `Check out this ${watch.name} on my wrist!`,
        });
      } else {
        downloadDataUrl(png, "wristfit.png");
      }
    } catch {
      downloadDataUrl(png, "wristfit.png");
    }
  };

  const previewStyle = useMemo(() => {
    // Render the overlay by mapping image pixels to container CSS pixels
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !imgDims.w || !imgDims.h) return {};
    const scaleX = rect.width / imgDims.w;
    const scaleY = rect.height / imgDims.h;
    const cx = anchor.x * scaleX;
    const cy = anchor.y * scaleY;
    const d = targetDiameterPx * ((scaleX + scaleY) / 2);
    return {
      transform: `translate(${cx - d / 2}px, ${cy - d / 2}px) rotate(${(angleRad * 180) / Math.PI}deg)`,
      width: `${d}px`,
      height: `${d}px`,
    };
  }, [anchor, angleRad, targetDiameterPx, imgDims]);

  return (
    <div className="preview-screen">
      <div className="top-bar">
        <button className="btn ghost" onClick={onBack} aria-label="Go back">← Back</button>
        <div className="brand">
          <span className="logo-dot" />
          WristFit
        </div>
        <div className="top-actions">
          <button className="btn secondary" onClick={shareOrDownload}>Share</button>
        </div>
      </div>

      <div
        className="preview-container"
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img ref={imgRef} src={baseImageSrc} alt="Captured" className="preview-image" />
        <img src={watch.svgDataUri} alt={watch.name} className="watch-overlay" style={previewStyle} draggable="false" />
        <div className="hint">Drag to adjust. Use sliders to fine-tune.</div>
      </div>

      <div className="control-sheet">
        <div className="slider-group">
          <label>Wrist width (mm)</label>
          <input
            type="range"
            min="40"
            max="80"
            step="1"
            value={userWristWidthMm}
            onChange={(e) => setUserWristWidthMm(parseInt(e.target.value, 10))}
          />
          <div className="slider-value">{userWristWidthMm} mm</div>
        </div>

        <div className="slider-group">
          <label>Rotation (°)</label>
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={angleAdjust}
            onChange={(e) => setAngleAdjust(parseInt(e.target.value, 10))}
          />
          <div className="slider-value">{angleAdjust}°</div>
        </div>

        <div className="action-row">
          <button className="btn primary" onClick={doCompose}>Render</button>
          <button className="btn" onClick={shareOrDownload}>Share</button>
        </div>
        <div className="meta-row">
          <span className="badge">Detected: {detection?.provider || "N/A"}</span>
          <span className="badge">Watch: {watch?.name} ({watch?.diameterMm} mm)</span>
        </div>
      </div>
    </div>
  );
}

function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  requestAnimationFrame(() => {
    document.body.removeChild(a);
  });
}
