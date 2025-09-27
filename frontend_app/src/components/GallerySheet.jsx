import React from "react";

/**
 * GallerySheet - bottom sheet to select watch from the gallery.
 * Props:
 *  - watches: Array<{id,name,diameterMm,svgDataUri,tone}>
 *  - isOpen: boolean
 *  - onClose(): void
 *  - onSelect(watch): void
 */

// PUBLIC_INTERFACE
export default function GallerySheet({ watches = [], isOpen, onClose, onSelect }) {
  /** Bottom sheet that lists watches and allows user to select one. */
  return (
    <div className={`sheet ${isOpen ? "open" : ""}`} role="dialog" aria-label="Watch gallery">
      <div className="sheet-handle" onClick={onClose} />
      <div className="sheet-header">
        <h3>Choose your watch</h3>
        <button className="btn ghost" onClick={onClose} aria-label="Close gallery">
          Close
        </button>
      </div>
      <div className="watch-grid">
        {watches.map((w) => (
          <button key={w.id} className="watch-card" onClick={() => onSelect?.(w)} aria-label={`Select ${w.name}`}>
            <div className={`watch-thumb tone-${w.tone || "blue"}`}>
              <img src={w.svgDataUri} alt={w.name} />
            </div>
            <div className="watch-meta">
              <div className="watch-name">{w.name}</div>
              <div className="watch-size">{w.diameterMm} mm</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
