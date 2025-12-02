// 공통 타입 정의

export interface Profile {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  role?: 'admin' | 'student';
  avatar_url?: string | null;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string | null;
  tags: string[] | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
  view_count?: number;
  commentCount?: number;
  likeCount?: number;
  is_hidden?: boolean;
  profiles?: Partial<Profile>;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  project_id?: string;
  post_id?: string;
  parent_comment_id?: string | null;
  profiles?: {
    name?: string;
    avatar_url?: string | null;
  };
  projects?: {
    title: string;
  };
  is_hidden?: boolean;
  replies?: Comment[];
  likeCount?: number;
  userLiked?: boolean;
}

export interface Like {
  id: string;
  user_id: string;
  project_id: string;
  created_at?: string;
}

export interface Track {
  name: string;
  duration: string;
  description: string;
  topics: string[];
}

export interface MediaAsset {
  type: string;
  title: string;
  emoji: string;
  src?: string;
}

export interface Curriculum {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  duration: string;
  students: string;
  price?: number;
  tracks: Track[];
  mediaAssets: MediaAsset[];
  created_at?: string;
  updated_at?: string;
}

