export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string | null;
  audio_url: string | null;
  video_url: string | null;
  user_id: string;
  is_published: boolean;
  created_at: string;
};
