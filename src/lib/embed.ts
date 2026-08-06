const YOUTUBE_RE =
  /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=([\w-]{11})\S*|youtu\.be\/([\w-]{11})\S*|youtube\.com\/embed\/([\w-]{11})\S*)$/i;

const VIMEO_RE = /^https?:\/\/(?:www\.)?vimeo\.com\/(\d+)\S*$/i;

const AUDIO_RE = /^https?:\/\/\S+\.(mp3|wav|ogg|m4a|aac|flac)(\?\S*)?$/i;

const IMAGE_RE = /^https?:\/\/\S+\.(png|jpe?g|gif|webp|avif|svg)(\?\S*)?$/i;

/**
 * Lets an admin paste a bare YouTube/Vimeo/audio/image link on its own line
 * in the markdown editor and have it render as a real embed, without writing
 * any HTML by hand.
 */
export function autoEmbedMedia(markdown: string): string {
  return markdown
    .split("\n")
    .map((rawLine) => {
      const line = rawLine.trim();
      if (!line) return rawLine;

      const youtube = line.match(YOUTUBE_RE);
      if (youtube) {
        const id = youtube[1] || youtube[2] || youtube[3];
        return `<iframe src="https://www.youtube.com/embed/${id}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
      }

      const vimeo = line.match(VIMEO_RE);
      if (vimeo) {
        return `<iframe src="https://player.vimeo.com/video/${vimeo[1]}" title="Vimeo video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
      }

      if (AUDIO_RE.test(line)) {
        return `<audio controls src="${line}"></audio>`;
      }

      if (IMAGE_RE.test(line)) {
        return `![](${line})`;
      }

      return rawLine;
    })
    .join("\n");
}
