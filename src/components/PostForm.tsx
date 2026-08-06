"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/lib/types";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type Props = {
  userId: string;
  initialPost?: Post;
};

export function PostForm({ userId, initialPost }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = Boolean(initialPost);

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [coverImage, setCoverImage] = useState(
    initialPost?.cover_image ?? "",
  );
  const [isPublished, setIsPublished] = useState(
    initialPost?.is_published ?? false,
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function insertAtCursor(snippet: string) {
    const textarea = contentRef.current;

    if (textarea) {
      const start = textarea.selectionStart ?? content.length;
      const end = textarea.selectionEnd ?? content.length;
      setContent(content.slice(0, start) + snippet + content.slice(end));
    } else {
      setContent((prev) => `${prev}\n${snippet}`);
    }
  }

  async function uploadToBlogMedia(file: File) {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("blog-media")
      .upload(path, file);

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("blog-media").getPublicUrl(path);

    return publicUrl;
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError(null);

    try {
      const publicUrl = await uploadToBlogMedia(file);
      insertAtCursor(`![${file.name}](${publicUrl})\n`);

      try {
        await navigator.clipboard.writeText(publicUrl);
        setNotice("Image uploaded — URL copied to clipboard and inserted below.");
      } catch {
        setNotice("Image uploaded and inserted below.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleAudioUpload(file: File) {
    setUploading(true);
    setError(null);

    try {
      const publicUrl = await uploadToBlogMedia(file);
      insertAtCursor(`${publicUrl}\n`);
      setNotice("Audio uploaded and inserted below as a player.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleInsertVideoLink() {
    const url = window.prompt("Paste a YouTube or Vimeo link:");
    if (!url) return;
    insertAtCursor(`${url.trim()}\n`);
    setNotice("Video link inserted — it will embed automatically when published.");
  }

  async function handleCoverUpload(file: File) {
    setUploading(true);
    setError(null);

    const ext = file.name.split(".").pop();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("blog-media")
      .upload(path, file);

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("blog-media").getPublicUrl(path);

    setCoverImage(publicUrl);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      title,
      slug,
      content,
      cover_image: coverImage || null,
      is_published: isPublished,
      user_id: userId,
    };

    const { error: saveError } = isEditing
      ? await supabase.from("posts").update(payload).eq("id", initialPost!.id)
      : await supabase.from("posts").insert(payload);

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-xs uppercase tracking-widest text-muted">
          Title
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full rounded border border-border bg-black/40 px-3 py-2 text-sm text-fg outline-none focus:border-gold"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-widest text-muted">
          Slug
        </label>
        <input
          type="text"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          className="w-full rounded border border-border bg-black/40 px-3 py-2 text-sm text-fg outline-none focus:border-gold"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-widest text-muted">
          Cover Image
        </label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCoverUpload(file);
            }}
            className="text-sm text-muted file:mr-3 file:rounded file:border file:border-gold file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:uppercase file:tracking-widest file:text-gold hover:file:bg-gold hover:file:text-black"
          />
        </div>
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt="Cover preview"
            className="mt-3 h-32 w-auto rounded border border-border object-cover"
          />
        )}
      </div>

      <div>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <label className="block text-xs uppercase tracking-widest text-muted">
            Content (Markdown)
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded border border-border px-2 py-1 text-[10px] uppercase tracking-widest text-muted hover:border-gold hover:text-gold">
              {uploading ? "Uploading…" : "Insert Image"}
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </label>
            <label className="cursor-pointer rounded border border-border px-2 py-1 text-[10px] uppercase tracking-widest text-muted hover:border-gold hover:text-gold">
              {uploading ? "Uploading…" : "Upload Audio"}
              <input
                type="file"
                accept="audio/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAudioUpload(file);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </label>
            <button
              type="button"
              disabled={uploading}
              onClick={handleInsertVideoLink}
              className="rounded border border-border px-2 py-1 text-[10px] uppercase tracking-widest text-muted hover:border-gold hover:text-gold disabled:opacity-50"
            >
              Insert Video Link
            </button>
          </div>
        </div>
        <textarea
          ref={contentRef}
          required
          rows={18}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write in Markdown. To embed media, paste a link on its own line — YouTube/Vimeo links become video players, image links become photos, and audio file links (.mp3, .wav, ...) become audio players. No HTML needed."
          className="w-full rounded border border-border bg-black/40 px-3 py-2 font-mono text-sm text-fg outline-none focus:border-gold"
        />
        <p className="mt-1 text-xs text-muted">
          Tip: a link on its own line auto-embeds — YouTube/Vimeo become
          videos, image links become photos, and audio links become players.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is_published"
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="h-4 w-4 accent-[var(--color-gold)]"
        />
        <label htmlFor="is_published" className="text-sm text-fg">
          Published (visible to the public)
        </label>
      </div>

      {notice && (
        <p className="rounded border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold">
          {notice}
        </p>
      )}

      {error && (
        <p className="rounded border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || uploading}
        className="rounded border border-gold bg-gold/10 px-6 py-2 text-sm font-semibold uppercase tracking-widest text-gold transition-colors hover:bg-gold hover:text-black disabled:opacity-50"
      >
        {saving ? "Saving…" : isEditing ? "Save Changes" : "Create Post"}
      </button>
    </form>
  );
}
