import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== ''
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export interface GalleryItem {
  id: string;
  title: string;
  caption: string | null;
  album: string;
  image_url: string;
  thumb_url: string;
  width: number;
  height: number;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
}

export interface SiteContentRow {
  key: string;
  value: string;
  updated_at: string;
}

export interface LeadRow {
  id: string;
  created_at: string;
  name: string;
  contact: string;
  need: string;
  source: string;
  status: 'new' | 'contacted' | 'closed';
  notes: string | null;
}

export interface AssistantConfigRow {
  id: string;
  system_prompt: string;
  fact_sheet: string;
  updated_at: string;
}
