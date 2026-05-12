import type { Category, Material, PriceRange, Style } from './taxonomy';

export type Role = 'influencer' | 'company' | 'admin';

export interface Profile {
  id: string;
  role: Role;
  display_name: string;
  bio: string | null;
  categories: string[];
  industry: string | null;
  avatar_url: string | null;
  // extensiones (migration 004)
  instagram_handle: string | null;
  tiktok_handle: string | null;
  youtube_handle: string | null;
  twitter_handle: string | null;
  followers_total: number | null;
  reach_estimate: number | null;
  hire_cost_min: number | null;
  hire_cost_max: number | null;
  location: string | null;
  created_at: string;
}

export type ProductStatus = 'pending' | 'verified' | 'rejected';

export interface Product {
  id: string;
  name: string;
  external_url: string;
  image_url: string | null;
  category: Category;
  style: Style | null;
  material: Material | null;
  price_range: PriceRange;
  price_numeric: number | null;
  tags: string[];
  description: string | null;
  status: ProductStatus;
  submitted_by: string | null;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface LinkRow {
  id: string;
  short_code: string;
  influencer_id: string;
  product_id: string;
  coupon_code: string | null;
  created_at: string;
}

export interface LinkStats {
  link_id: string;
  influencer_id: string;
  product_id: string;
  clicks: number;
  conversions: number;
  revenue: number;
  cr: number;
}

export interface InfluencerCategoryStats {
  influencer_id: string;
  category: Category;
  style: Style | null;
  material: Material | null;
  price_range: PriceRange;
  clicks: number;
  conversions: number;
  revenue: number;
  cr: number;
}

export interface InfluencerTotals {
  influencer_id: string;
  total_links: number;
  total_clicks: number;
  total_conversions: number;
  total_revenue: number;
  cr_global: number;
}

export interface Recommendation {
  influencer: Pick<
    Profile,
    | 'id'
    | 'display_name'
    | 'bio'
    | 'categories'
    | 'avatar_url'
    | 'followers_total'
    | 'reach_estimate'
    | 'hire_cost_min'
    | 'hire_cost_max'
    | 'instagram_handle'
    | 'tiktok_handle'
    | 'youtube_handle'
  >;
  fit_score: number; // 0-100
  components: {
    exact_perf: number;
    similar_perf: number;
    category_match: number;
    style_match: number;
    price_match: number;
    volume_confidence: number;
  };
  evidence: {
    best_category: Category | null;
    cr_on_similar: number;
    volume: number;
    top_similar_products: Array<{ product_id: string; name: string; similarity: number; cr: number }>;
    match_reasons: string[];
  };
  explanation?: {
    headline: string;
    paragraph: string;
    reasons: string[];
  };
}
