"use client";

import { useEffect, useRef, useState } from "react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://blog.theinvisiblepanchos.com";

type Props = {
  slug: string;
  title: string;
  variant?: "icon" | "button";
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

export function ShareButton({ slug, title, variant = "button" }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const url = `${SITE_URL}/posts/${slug}`;

    // Copy first, synchronously inside the tap — Safari drops clipboard access
    // once an await (like the share sheet) has run. The copied link is what
    // lets the user paste it into Instagram's Link sticker / bio / DMs.
    const copied = await copyText(url);
    setStatus(copied ? "copied" : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2200);

    // Phones/tablets: also open the native share sheet (Instagram, Facebook,
    // Messages, etc.). Desktop just copies.
    const isTouch =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;
    if (isTouch && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
      } catch {
        // user dismissed the sheet — the link is already copied
      }
    }
  }

  const label =
    status === "copied"
      ? "Link copied"
      : status === "failed"
        ? "Copy failed"
        : "Share";

  const icon = (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
      <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
    </svg>
  );

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleShare}
        aria-label={`Share "${title}" — copies the link`}
        title={status === "idle" ? "Share / copy link" : label}
        className={`flex h-8 min-w-8 items-center justify-center gap-1 rounded-full border bg-black/70 px-2 text-[10px] font-semibold uppercase tracking-wider backdrop-blur transition-colors ${
          status === "copied"
            ? "border-gold text-gold"
            : "border-border text-fg hover:border-gold hover:text-gold"
        }`}
      >
        {icon}
        {status !== "idle" && <span>{label}</span>}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-2 rounded border px-3 py-1.5 text-xs uppercase tracking-widest transition-colors ${
        status === "copied"
          ? "border-gold text-gold"
          : "border-border text-muted hover:border-gold hover:text-gold"
      }`}
    >
      {icon}
      <span aria-live="polite">{label}</span>
    </button>
  );
}
