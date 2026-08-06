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
  const [videoLink, setVideoLink] = useState("");
  const [audioLink, setAudioLink] = useState("");

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
    const url = videoLink.trim();
    if (!url) return;
    insertAtCursor(`${url}\n`);
    setVideoLink("");
    setNotice("Video link inserted — it will embed automatically.");
  }

  function handleInsertAudioLink() {
    const url = audioLink.trim();
    if (!url) return;
    insertAtCursor(`${url}\n`);
    setAudioLink("");
    setNotice("Audio link inserted — it will embed automatically.");
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
          className="w-full rounded border border-border bg-panel-2 px-3 py-2 text-sm text-fg outline-none focus:border-gold"
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
          className="w-full rounded border border-border bg-panel-2 px-3 py-2 text-sm text-fg outline-none focus:border-gold"
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

      <div className="panel space-y-4 rounded-lg p-4">
        <p className="text-xs uppercase tracking-widest text-muted">
          Media Tools
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
                e.target.value = "";
              }}
              className="w-full text-xs text-muted file:mr-3 file:rounded file:border file:border-gold file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:uppercase file:tracking-widest file:text-gold hover:file:bg-gold hover:file:text-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted">
              Upload Audio
            </label>
            <input
              type="file"
              accept="audio/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAudioUpload(file);
                e.target.value = "";
              }}
              className="w-full text-xs text-muted file:mr-3 file:rounded file:border file:border-gold file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:uppercase file:tracking-widest file:text-gold hover:file:bg-gold hover:file:text-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted">
              Video Link (YouTube / Vimeo)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded border border-border bg-panel-2 px-3 py-1.5 text-xs text-fg outline-none focus:border-gold"
              />
              <button
                type="button"
                onClick={handleInsertVideoLink}
                disabled={!videoLink.trim()}
                className="shrink-0 rounded border border-gold px-3 py-1.5 text-[10px] uppercase tracking-widest text-gold hover:bg-gold hover:text-black disabled:opacity-40"
              >
                Embed
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted">
              Audio Link
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={audioLink}
                onChange={(e) => setAudioLink(e.target.value)}
                placeholder="https://example.com/track.mp3"
                className="w-full rounded border border-border bg-panel-2 px-3 py-1.5 text-xs text-fg outline-none focus:border-gold"
              />
              <button
                type="button"
                onClick={handleInsertAudioLink}
                disabled={!audioLink.trim()}
                className="shrink-0 rounded border border-gold px-3 py-1.5 text-[10px] uppercase tracking-widest text-gold hover:bg-gold hover:text-black disabled:opacity-40"
              >
                Embed
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted">
          Uploads and links are inserted into the content below on their own
          line, where they automatically become a real player or image — no
          HTML needed.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-widest text-muted">
          Content (Markdown)
        </label>
        <textarea
          ref={contentRef}
          required
          rows={18}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write in Markdown. Use the Media Tools above to add images, audio, and video — or paste a link on its own line."
          className="w-full rounded border border-border bg-panel-2 px-3 py-2 font-mono text-sm text-fg outline-none focus:border-gold"
        />
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
