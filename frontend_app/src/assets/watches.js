/**
 * Static watch gallery assets and metadata.
 * Each watch asset uses a 1000x1000 viewBox where the face fills the canvas.
 * The "diameterMm" is the real-world case diameter to use for true-to-size scaling.
 */

function svgDataUri(svg) {
  const encoded = encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22");
  return `data:image/svg+xml;charset=UTF-8,${encoded}`;
}

function watchSvgTemplate({ faceColor = "#ffffff", bezelColor = "#111827", strapColor = "#94a3b8", accent = "#2563EB" } = {}) {
  // Minimalist round watch with strap top/bottom, subtle shadows, accent second hand.
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
  <defs>
    <radialGradient id="faceGrad" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="${faceColor}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${faceColor}" stop-opacity="0.95"/>
    </radialGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Strap -->
  <rect x="450" y="-80" width="100" height="1160" rx="40" fill="${strapColor}"/>
  <rect x="435" y="-100" width="130" height="160" rx="26" fill="${strapColor}" opacity="0.85"/>

  <!-- Bezel -->
  <circle cx="500" cy="500" r="340" fill="${bezelColor}" filter="url(#shadow)"/>
  <!-- Face -->
  <circle cx="500" cy="500" r="320" fill="url(#faceGrad)"/>

  <!-- Tick marks -->
  ${Array.from({ length: 60 })
    .map((_, i) => {
      const angle = (i * Math.PI * 2) / 60;
      const inner = i % 5 === 0 ? 270 : 300;
      const outer = 310;
      const x1 = 500 + inner * Math.cos(angle);
      const y1 = 500 + inner * Math.sin(angle);
      const x2 = 500 + outer * Math.cos(angle);
      const y2 = 500 + outer * Math.sin(angle);
      const stroke = i % 5 === 0 ? "#111827" : "#6b7280";
      const w = i % 5 === 0 ? 6 : 3;
      return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round"/>`;
    })
    .join("\n")}

  <!-- Hands -->
  <line x1="500" y1="500" x2="500" y2="280" stroke="#1f2937" stroke-width="10" stroke-linecap="round"/>
  <line x1="500" y1="500" x2="620" y2="500" stroke="#374151" stroke-width="6" stroke-linecap="round"/>
  <line x1="500" y1="500" x2="500" y2="220" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>

  <!-- Center cap -->
  <circle cx="500" cy="500" r="10" fill="${bezelColor}"/>
</svg>
  `;
}

const Aqua40 = {
  id: "aqua_40",
  name: "Aqua Classic 40",
  diameterMm: 40,
  assetPx: 1000,
  svgDataUri: svgDataUri(
    watchSvgTemplate({
      faceColor: "#e5f0ff",
      bezelColor: "#111827",
      strapColor: "#2563EB",
      accent: "#2563EB",
    })
  ),
  tone: "blue",
};

const Shadow44 = {
  id: "shadow_44",
  name: "Shadow Chrono 44",
  diameterMm: 44,
  assetPx: 1000,
  svgDataUri: svgDataUri(
    watchSvgTemplate({
      faceColor: "#f1f5f9",
      bezelColor: "#111827",
      strapColor: "#334155",
      accent: "#111827",
    })
  ),
  tone: "slate",
};

const Amber42 = {
  id: "amber_42",
  name: "Amber Sport 42",
  diameterMm: 42,
  assetPx: 1000,
  svgDataUri: svgDataUri(
    watchSvgTemplate({
      faceColor: "#fff7ed",
      bezelColor: "#111827",
      strapColor: "#F59E0B",
      accent: "#F59E0B",
    })
  ),
  tone: "amber",
};

const Silver38 = {
  id: "silver_38",
  name: "Silver Minimal 38",
  diameterMm: 38,
  assetPx: 1000,
  svgDataUri: svgDataUri(
    watchSvgTemplate({
      faceColor: "#ffffff",
      bezelColor: "#6b7280",
      strapColor: "#cbd5e1",
      accent: "#2563EB",
    })
  ),
  tone: "silver",
};

// PUBLIC_INTERFACE
export const WATCHES = [Aqua40, Shadow44, Amber42, Silver38];
