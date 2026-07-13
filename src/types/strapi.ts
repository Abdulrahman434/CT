// Strapi v5 response wrapper
export type StrapiResponse<T> = {
  data: T;
  meta?: { pagination?: { page: number; pageSize: number; total: number } };
};

export type StrapiMedia = {
  id: number;
  url: string;
  alternativeText?: string | null;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
};

export type StrapiHospital = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  logo?: StrapiMedia | null;
  primary_color?: string;
  address?: string;
  phone?: string;
  is_active: boolean;
};

export type StrapiSectionVisibility = {
  id: number;
  documentId: string;
  hospital?: StrapiHospital;
  show_iptv: boolean;
  show_care_plan: boolean;
  show_about_us: boolean;
  show_prayer_times: boolean;
  show_food_menu: boolean;
  show_resources: boolean;
  show_care_team: boolean;
};

export type StrapiAboutUs = {
  id: number;
  documentId: string;
  hospital?: StrapiHospital;
  title?: string;
  body?: string;            // markdown
  mission_statement?: string;
  featured_image?: StrapiMedia | null;
  phone?: string;
  email?: string;
  website?: string;
};

export type StrapiResource = {
  id: number;
  documentId: string;
  hospital?: StrapiHospital;
  title: string;
  description?: string;
  resource_type: 'pdf' | 'url' | 'video';
  pdf_file?: StrapiMedia | null;
  external_url?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
};
