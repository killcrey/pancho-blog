const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;

function isHeic(file: File) {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.hei[cf]$/i.test(file.name)
  );
}

/**
 * Resizes and recompresses an image client-side before upload. Converts
 * HEIC/HEIF to JPEG (most browsers can't render HEIC in an <img>), and caps
 * dimensions/quality so phone-camera photos don't land in Storage at
 * 5-10MB apiece.
 */
export async function compressImage(file: File): Promise<Blob> {
  let source: Blob = file;

  if (isHeic(file)) {
    const heic2any = (await import("heic2any")).default;
    const result = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: JPEG_QUALITY,
    });
    source = Array.isArray(result) ? result[0] : result;
  }

  const bitmap = await createImageBitmap(source, {
    imageOrientation: "from-image",
  });

  let { width, height } = bitmap;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image compression failed"))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}
