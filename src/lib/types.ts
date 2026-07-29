export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  total_hours: number;
  created_at: string;
}

export interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string | null;
  organization: string;
  address: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  category: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  duration_hours: number | null;
  spots_available: number | null;
  image_url: string | null;
  distance_miles: number | null;
  created_by: string | null;
  created_at: string;
}

export interface VolunteerSession {
  id: string;
  user_id: string;
  opportunity_id: string | null;
  organization: string | null;
  date: string;
  hours: number;
  week_start: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  location: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles?: Profile;
  liked?: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  name: string | null;
  avatar_url: string | null;
  last_message: string | null;
  last_message_at: string;
  created_at: string;
}

export interface ActivityNotification {
  id: string;
  user_id: string;
  actor_id: string;
  type: 'like' | 'comment' | 'follow' | 'save' | 'share';
  post_id: string | null;
  content_preview: string | null;
  is_read: boolean;
  image_url: string | null;
  created_at: string;
  actor?: Profile;
}
