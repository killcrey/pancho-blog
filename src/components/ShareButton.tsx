"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { renderStoryImage } from "@/lib/storyImage";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://blog.theinvisiblepanchos.com";

type Props = {
  slug: string;
  title: string;
  imageUrl?: string | null;
  createdAt: string;
  author?: string | null;
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

function isTouch() {
  return window.matchMedia("(pointer: coarse)").matches;
}

const ICON = (
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

export function ShareButton({
  slug,
  title,
  imageUrl = null,
  createdAt,
  author = null,
  variant = "button",
}: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const url = `${SITE_URL}/posts/${slug}`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  function openSheet(e: React.MouseEvent) {
    // The card button sits over a <Link>; never navigate when sharing.
    e.preventDefault();
    e.stopPropagation();
    setMessage("");
    setOpen(true);
  }

  function closeSoon(ms: number) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), ms);
  }

  async function shareLink() {
    // Copy first, synchronously inside the tap — Safari drops clipboard
    // access after an await. The copied link is the Instagram path (Link
    // sticker / bio / DM); phones also get the native share sheet.
    const copied = await copyText(url);
    setMessage(copied ? "Link copied" : "Couldn't copy — long-press the address bar");
    if (isTouch() && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
      } catch {
        // dismissed — link is already copied
      }
    }
    closeSoon(1400);
  }

  async function shareStory() {
    if (busy) return;
    setBusy(true);
    // Same reason as above: copy the link before any await so it can be
    // pasted into the Story's Link sticker.
    const copiedPromise = copyText(url);
    try {
      setMessage("Making your image…");
      const blob = await renderStoryImage({
        title,
        imageUrl,
        createdAt,
        author,
        siteHost: new URL(SITE_URL).host,
      });
      const copied = await copiedPromise;
      const file = new File([blob], `${slug}-story.jpg`, { type: "image/jpeg" });

      if (
        isTouch() &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        setMessage(
          copied
            ? "Link copied — add it with a Link sticker"
            : "Pick Instagram, then add the link with a Link sticker",
        );
        try {
          await navigator.share({ files: [file] });
        } catch {
          // dismissed
        }
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${slug}-story.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        setMessage(
          copied
            ? "Image saved · link copied for your Link sticker"
            : "Image saved",
        );
      }
      closeSoon(2200);
    } catch {
      setMessage("Couldn't make the image — try again");
    } finally {
      setBusy(false);
    }
  }

  const trigger =
    variant === "icon" ? (
      <button
        type="button"
        onClick={openSheet}
        aria-label={`Share "${title}"`}
        title="Share"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-black/70 text-fg backdrop-blur transition-colors hover:border-gold hover:text-gold"
      >
        {ICON}
      </button>
    ) : (
      <button
        type="button"
        onClick={openSheet}
        className="inline-flex items-center gap-2 rounded border border-border px-3 py-1.5 text-xs uppercase tracking-widest text-muted transition-colors hover:border-gold hover:text-gold"
      >
        {ICON}
        <span>Share</span>
      </button>
    );

  const optionClass =
    "flex w-full items-center justify-between rounded border border-border px-4 py-3 text-left text-sm uppercase tracking-widest text-fg transition-colors hover:border-gold hover:text-gold disabled:opacity-50";

  const sheet = open
    ? createPortal(
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Share this post"
        >
          <div
            className="panel w-full max-w-sm space-y-3 rounded-t-xl p-5 sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="truncate text-xs uppercase tracking-widest text-gold">
              {title}
            </p>
            <button type="button" className={optionClass} onClick={shareLink}>
              <span>Share link</span>
              <span className="text-xs text-muted">Copies it</span>
            </button>
            <button
              type="button"
              className={optionClass}
              onClick={shareStory}
              disabled={busy}
            >
              <span>Image for Stories</span>
              <span className="text-xs text-muted">1080 × 1920</span>
            </button>
            <p
              className="min-h-5 text-center text-xs uppercase tracking-widest text-muted"
              aria-live="polite"
            >
              {message}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full py-1 text-xs uppercase tracking-widest text-muted hover:text-gold"
            >
              Close
            </button>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      {trigger}
      {sheet}
    </>
  );
}
