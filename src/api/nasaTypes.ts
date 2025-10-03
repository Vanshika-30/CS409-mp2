// ---------------- NASA Images API ----------------
export interface SearchResponse {
  collection: {
    version: string;
    href: string;
    items: SearchItem[];
    metadata: { total_hits: number };
    links?: { rel: string; prompt: string; href: string }[];
  };
}

export interface SearchItem {
  href: string;
  data: MediaData[];
  links?: MediaLink[];
}

export interface MediaData {
  nasa_id: string;
  title: string;
  description?: string;
  media_type: string;
  date_created: string;
  keywords?: string[];
  center?: string;
  thumbnail?: string;
}

export interface MediaLink {
  href: string;
  rel: string;
  render?: string;
}

export interface AssetResponse {
  collection: {
    version: string;
    href: string;
    items: { href: string }[];
  };
}
