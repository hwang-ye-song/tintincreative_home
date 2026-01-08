// 공통 타입 정의

export interface Profile {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  role?: 'admin' | 'teacher' | 'student';
  avatar_url?: string | null;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string | null;
  tags: string[] | null;
  image_url: string | null;
  video_url?: string | null;
  attachments?: ProjectAttachment[];
  created_at: string;
  user_id: string;
  view_count?: number;
  commentCount?: number;
  likeCount?: number;
  is_hidden?: boolean;
  is_best?: boolean;
  is_featured_home?: boolean;
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

export interface ProjectAttachment {
  name: string;
  url: string;
  size: number;
  type?: string;
  password?: string; // 최대 4자리 비밀번호
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Payment {
  id: string;
  user_id: string;
  curriculum_id?: string | null;
  course_id?: string | null;
  amount: number;
  status: PaymentStatus;
  payment_key: string;
  order_id: string;
  payment_method?: string | null;
  refunded_amount?: number | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentRequest {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  successUrl: string;
  failUrl: string;
  curriculumId?: string;
  courseId?: string;
}

export interface PaymentApproval {
  paymentKey: string;
  orderId: string;
  amount: number;
}

