const YOUTUBE_RE =
  /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=([\w-]{11})\S*|youtu\.be\/([\w-]{11})\S*|youtube\.com\/embed\/([\w-]{11})\S*)$/i;

const VIMEO_RE = /^https?:\/\/(?:www\.)?vimeo\.com\/(\d+)\S*$/i;

/** Converts a YouTube/Vimeo watch link into an embeddable iframe src, or null if unrecognized. */
export function getVideoEmbedUrl(url: string): string | null {
  const trimmed = url.trim();

  const youtube = trimmed.match(YOUTUBE_RE);
  if (youtube) {
    const id = youtube[1] || youtube[2] || youtube[3];
    return `https://www.youtube.com/embed/${id}`;
  }

  const vimeo = trimmed.match(VIMEO_RE);
  if (vimeo) {
    return `https://player.vimeo.com/video/${vimeo[1]}`;
  }

  return null;
}
