// Draws a 1080x1920 Instagram Stories card for a post. Browser-only (canvas).
// Everything important stays inside Instagram's top/bottom UI margins, and a
// clear band is left under the site address for a Link sticker.

const W = 1080;
const H = 1920;
const BG = "#05020a";
const GOLD = "#D4AF37";

export type StoryPost = {
  title: string;
  imageUrl: string | null;
  createdAt: string;
  author: string | null;
  siteHost: string;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image failed"));
    img.src = src;
  });
}

// A cached non-CORS copy of the same URL can make the CORS load fail, so a
// second attempt adds a throwaway query param to force a fresh CORS fetch.
async function loadCover(url: string): Promise<HTMLImageElement | null> {
  try {
    return await loadImage(url);
  } catch {
    try {
      const sep = url.includes("?") ? "&" : "?";
      return await loadImage(`${url}${sep}story=1`);
    } catch {
      return null;
    }
  }
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width <= maxWidth || !line) {
      line = test;
    } else {
      lines.push(line);
      line = words[i];
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);

  // Out of lines with words left over -> ellipsise the last line.
  const used = lines.join(" ").split(/\s+/).length;
  if (used < words.length) {
    let last = lines[lines.length - 1] ?? "";
    while (last && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1).trimEnd();
    }
    lines[lines.length - 1] = `${last}…`;
  }
  return lines;
}

export async function renderStoryImage(post: StoryPost): Promise<Blob> {
  const family =
    getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  try {
    await Promise.all([
      document.fonts.load(`700 60px ${family}`),
      document.fonts.load(`600 30px ${family}`),
    ]);
  } catch {
    // fall back to whatever is available
  }

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  // Background with a soft gold glow behind the cover.
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 700, 80, W / 2, 700, 900);
  glow.addColorStop(0, "rgba(212,175,55,0.22)");
  glow.addColorStop(1, "rgba(212,175,55,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Cover, cropped to a square.
  const size = 840;
  const x = (W - size) / 2;
  const y = 280;
  const cover = post.imageUrl ? await loadCover(post.imageUrl) : null;
  ctx.fillStyle = "#120a1e";
  ctx.fillRect(x, y, size, size);
  if (cover) {
    const s = Math.min(cover.naturalWidth, cover.naturalHeight);
    const sx = (cover.naturalWidth - s) / 2;
    const sy = (cover.naturalHeight - s) / 2;
    ctx.drawImage(cover, sx, sy, s, s, x, y, size, size);
  }
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 6;
  ctx.strokeRect(x - 3, y - 3, size + 6, size + 6);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Date
  const date = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  ctx.fillStyle = GOLD;
  ctx.font = `600 34px ${family}`;
  if ("letterSpacing" in ctx) {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "6px";
  }
  ctx.fillText(date.toUpperCase(), W / 2, y + size + 90);

  // Title (up to 3 lines)
  if ("letterSpacing" in ctx) {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "0px";
  }
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 66px ${family}`;
  const lines = wrapLines(ctx, post.title, W - 200, 3);
  let ty = y + size + 185;
  for (const l of lines) {
    ctx.fillText(l, W / 2, ty);
    ty += 80;
  }

  if (post.author) {
    ctx.fillStyle = "#9a93a8";
    ctx.font = `600 32px ${family}`;
    ctx.fillText(`by ${post.author}`, W / 2, ty + 10);
  }

  // Brand + address, with the band below left empty for the Link sticker.
  ctx.fillStyle = GOLD;
  ctx.font = `700 36px ${family}`;
  if ("letterSpacing" in ctx) {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "8px";
  }
  ctx.fillText("THE INVISIBLE PANCHOS", W / 2, 1530);
  if ("letterSpacing" in ctx) {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "2px";
  }
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 34px ${family}`;
  ctx.fillText(post.siteHost, W / 2, 1585);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("export failed"))),
      "image/jpeg",
      0.9,
    );
  });
}
