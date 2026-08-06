"use client";

import { useEffect, useRef, useState } from "react";
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

function ToolbarButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded border border-border px-2.5 py-1 text-xs text-fg hover:border-gold hover:text-gold"
    >
      {children}
    </button>
  );
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
  const [audioUrl, setAudioUrl] = useState(initialPost?.audio_url ?? "");
  const [videoUrl, setVideoUrl] = useState(initialPost?.video_url ?? "");
  const [isPublished, setIsPublished] = useState(
    initialPost?.is_published ?? false,
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && initialPost?.content) {
      contentRef.current.innerHTML = initialPost.content;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function syncContent() {
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
    }
  }

  function exec(command: string) {
    contentRef.current?.focus();
    document.execCommand(command);
    syncContent();
  }

  function handleInsertLink() {
    const url = window.prompt("Enter a URL:");
    if (!url) return;

    contentRef.current?.focus();
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed) {
      const safeUrl = url.replace(/"/g, "&quot;");
      const safeLabel = url.replace(/</g, "&lt;");
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${safeUrl}">${safeLabel}</a>`,
      );
    } else {
      document.execCommand("createLink", false, url);
    }

    syncContent();
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

  async function handleCoverUpload(file: File) {
    setUploading(true);
    setError(null);

    try {
      setCoverImage(await uploadToBlogMedia(file));
      setNotice("Cover image uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleAudioFileUpload(file: File) {
    setUploading(true);
    setError(null);

    try {
      setAudioUrl(await uploadToBlogMedia(file));
      setNotice("Audio uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const plainTextContent = content.replace(/<[^>]*>/g, "").trim();
    if (!plainTextContent) {
      setError("Content is required.");
      return;
    }

    setSaving(true);

    const payload = {
      title,
      slug,
      content,
      cover_image: coverImage || null,
      audio_url: audioUrl || null,
      video_url: videoUrl || null,
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

      <div className="panel space-y-5 rounded-lg p-4">
        <p className="text-xs uppercase tracking-widest text-muted">
          Media (shown above the text)
        </p>

        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted">
            Cover Image
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverUpload(file);
                e.target.value = "";
              }}
              className="text-xs text-muted file:mr-3 file:rounded file:border file:border-gold file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:uppercase file:tracking-widest file:text-gold hover:file:bg-gold hover:file:text-black"
            />
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="or paste an image URL"
              className="min-w-0 flex-1 rounded border border-border bg-panel-2 px-3 py-1.5 text-xs text-fg outline-none focus:border-gold"
            />
          </div>
          {coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt="Cover preview"
              className="mt-3 h-32 w-auto rounded border border-border object-contain"
            />
          )}
        </div>

        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted">
            Audio
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept="audio/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAudioFileUpload(file);
                e.target.value = "";
              }}
              className="text-xs text-muted file:mr-3 file:rounded file:border file:border-gold file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:uppercase file:tracking-widest file:text-gold hover:file:bg-gold hover:file:text-black"
            />
            <input
              type="url"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="or paste an audio file URL"
              className="min-w-0 flex-1 rounded border border-border bg-panel-2 px-3 py-1.5 text-xs text-fg outline-none focus:border-gold"
            />
          </div>
          {audioUrl && (
            <audio controls src={audioUrl} className="mt-3 w-full" />
          )}
        </div>

        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted">
            Video Link (YouTube / Vimeo)
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full rounded border border-border bg-panel-2 px-3 py-1.5 text-xs text-fg outline-none focus:border-gold"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-widest text-muted">
          Content
        </label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          <ToolbarButton onClick={() => exec("bold")} label="Bold">
            <span className="font-bold">B</span>
          </ToolbarButton>
          <ToolbarButton onClick={() => exec("italic")} label="Italic">
            <span className="italic">I</span>
          </ToolbarButton>
          <ToolbarButton onClick={() => exec("underline")} label="Underline">
            <span className="underline">U</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => exec("insertUnorderedList")}
            label="Bulleted list"
          >
            • List
          </ToolbarButton>
          <ToolbarButton onClick={handleInsertLink} label="Insert link">
            Link
          </ToolbarButton>
        </div>
        <div
          ref={contentRef}
          contentEditable
          onInput={syncContent}
          onBlur={syncContent}
          data-placeholder="Write your post…"
          suppressContentEditableWarning
          className="prose-panchos min-h-[280px] w-full rounded border border-border bg-panel-2 px-3 py-2 text-sm text-fg outline-none focus:border-gold"
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
