export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  images: string[];
  audio_url: string | null;
  video_url: string | null;
  author: string | null;
  user_id: string;
  is_published: boolean;
  created_at: string;
};
