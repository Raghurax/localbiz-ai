export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_category: string;
  business_description?: string;
  location?: string;
  target_audience?: string;
  products_services?: string;
  preferred_language: string;
  secondary_language: string;
  brand_tone: string;
  contact_details?: string;
  logo_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface BusinessAsset {
  id: string;
  business_id: string;
  file_name: string;
  file_path: string;
  file_type: 'logo' | 'product' | 'shop' | 'ad' | 'video';
  mime_type?: string;
  file_size?: number;
  created_at: string;
}

export interface CampaignOutput {
  id: string;
  output_type: string;
  title?: string;
  content: string;
  language: string;
  metadata_json?: any;
  created_at: string;
}

export interface Campaign {
  id: string;
  business_id: string;
  name: string;
  campaign_type?: string;
  product?: string;
  offer?: string;
  language: string;
  platform: string;
  tone?: string;
  target_audience?: string;
  raw_user_prompt?: string;
  status: string;
  created_at: string;
  outputs: CampaignOutput[];
}

export interface SyntheticExample {
  id: string;
  business_type: string;
  product: string;
  campaign_type: string;
  offer: string;
  language: string;
  target_audience: string;
  platform: string;
  tone: string;
  marketing_goal: string;
  generated_content: {
    caption?: string;
    whatsapp?: string;
    poster?: string;
    script?: string;
    cta?: string;
    hashtags?: string;
  };
  quality_status: 'VALID' | 'NEEDS REVIEW' | 'REJECTED';
  quality_score: number;
  validation_notes?: {
    critical_errors?: string[];
    observations?: string[];
    offer_preserved?: boolean;
    duplicate?: boolean;
  };
  created_at: string;
}

export interface SyntheticDataset {
  id: string;
  name: string;
  category: string;
  language: string;
  total_generated: number;
  valid_count: number;
  rejected_count: number;
  duplicate_count: number;
  average_quality_score: number;
  created_at: string;
  examples: SyntheticExample[];
}

export interface GeneratedMedia {
  id: string;
  business_id: string;
  campaign_id?: string;
  media_type: 'image' | 'video';
  title?: string;
  file_path: string;
  aspect_ratio: string;
  platform: string;
  prompt_used?: string;
  metadata_json?: any;
  created_at: string;
}

export interface VideoManifest {
  video_id: string;
  title: string;
  format: string;
  resolution: string;
  total_duration_seconds: number;
  business_name: string;
  headline: string;
  offer: string;
  cta: string;
  script_preview: string;
  voiceover: string;
  scenes: Array<{
    scene_number: number;
    duration_seconds: number;
    title: string;
    bg_gradient: string;
    badge: string;
    main_heading: string;
    telugu_subtext: string;
    audio_cue: string;
    animation_type: string;
  }>;
  preview_url: string;
}
