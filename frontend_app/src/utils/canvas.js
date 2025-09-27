/**
 * Canvas composition utilities.
 */

// PUBLIC_INTERFACE
export function dataUriToImage(src) {
  /** Loads an Image from a data URI or URL and returns a Promise<HTMLImageElement>. */
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// PUBLIC_INTERFACE
export async function composeImageWithWatch({
  baseImageSrc,
  watchSvgDataUri,
  anchor,
  angleRad,
  targetDiameterPx,
  maskDataUri = null,
}) {
  /**
   * Composes the base image, watch overlay and optional segmentation mask for occlusion.
   * Returns a PNG data URI of the final composition.
   */
  if (!baseImageSrc || !watchSvgDataUri || !anchor || !targetDiameterPx) {
    throw new Error("Missing composition parameters.");
  }

  const [baseImg, watchImg, maskImg] = await Promise.all([
    dataUriToImage(baseImageSrc),
    dataUriToImage(watchSvgDataUri),
    maskDataUri ? dataUriToImage(maskDataUri) : Promise.resolve(null),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = baseImg.naturalWidth || baseImg.width;
  canvas.height = baseImg.naturalHeight || baseImg.height;
  const ctx = canvas.getContext("2d");

  // Draw base first
  ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

  // Draw watch on overlay (so we can apply occlusion if needed)
  const overlay = document.createElement("canvas");
  overlay.width = canvas.width;
  overlay.height = canvas.height;
  const octx = overlay.getContext("2d");

  octx.save();
  octx.translate(anchor.x, anchor.y);
  octx.rotate(angleRad);
  octx.drawImage(
    watchImg,
    -targetDiameterPx / 2,
    -targetDiameterPx / 2,
    targetDiameterPx,
    targetDiameterPx
  );
  octx.restore();

  if (maskImg) {
    // Remove the parts where the hand is present to create occlusion
    octx.globalCompositeOperation = "destination-out";
    octx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
    octx.globalCompositeOperation = "source-over";
  }

  // Composite overlay over base
  ctx.drawImage(overlay, 0, 0);

  return canvas.toDataURL("image/png");
}
