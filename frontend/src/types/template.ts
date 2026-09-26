export type ZoneId =
  | 'business_name'
  | 'headline'
  | 'subtitle'
  | 'product_image'
  | 'offer'
  | 'cta'
  | 'contact'
  | 'logo';

export type ZoneType = 'text' | 'image';

export type BadgeStyle = 'none' | 'pill' | 'card' | 'rosette';

export interface TemplateZone {
  id: ZoneId | string;
  type: ZoneType;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  align?: 'left' | 'center' | 'right';
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  lineHeight?: number;
  fit?: 'contain' | 'cover';
  badgeStyle?: BadgeStyle;
  badgeBg?: string;
  badgeBorder?: string;
  badgeRadius?: number;
  maxChars?: number;
}

export interface TemplateConfig {
  id: string;
  name: string;
  backgroundUrl: string;
  width: number;
  height: number;
  theme: 'blue' | 'cyan' | 'purple' | 'green';
  zones: TemplateZone[];
}

export interface PosterContent {
  business_name: string;
  headline: string;
  subtitle: string;
  offer: string;
  cta: string;
  contact: string;
  address?: string;
  product_image_url?: string;
  logo_url?: string;
  language: string;
}

export interface CopyVariation {
  id: number;
  label: string;
  headline: string;
  subtitle: string;
  offer: string;
  cta: string;
}
