// Discogs API Response Types

export interface DiscogsArtist {
  id: number;
  name: string;
  anv?: string;  // Artist name variation
  join?: string;
  role?: string;
  tracks?: string;
  resource_url: string;
}

export interface DiscogsLabel {
  id: number;
  name: string;
  catno: string;
  entity_type?: string;
  entity_type_name?: string;
  resource_url: string;
}

export interface DiscogsImage {
  type: 'primary' | 'secondary';
  uri: string;
  resource_url: string;
  uri150: string;
  width: number;
  height: number;
}

export interface DiscogsFormat {
  name: string;
  qty: string;
  descriptions?: string[];
  text?: string;
}

export interface DiscogsTrack {
  position: string;
  type_: string;
  title: string;
  duration: string;
  extraartists?: DiscogsArtist[];
}

export interface DiscogsCommunity {
  want: number;
  have: number;
  rating: {
    count: number;
    average: number;
  };
  status: string;
  data_quality: string;
}

export interface DiscogsRelease {
  id: number;
  status: string;
  year: number;
  resource_url: string;
  uri: string;
  artists: DiscogsArtist[];
  artists_sort: string;
  labels: DiscogsLabel[];
  formats: DiscogsFormat[];
  genres: string[];
  styles: string[];
  title: string;
  country: string;
  released: string;
  notes?: string;
  master_id: number;
  master_url: string;
  images?: DiscogsImage[];
  thumb?: string;
  tracklist: DiscogsTrack[];
  community: DiscogsCommunity;
  data_quality: string;
  estimated_weight?: number;
  lowest_price?: number;
  num_for_sale?: number;
}

export interface DiscogsMaster {
  id: number;
  main_release: number;
  most_recent_release: number;
  resource_url: string;
  uri: string;
  versions_url: string;
  main_release_url: string;
  most_recent_release_url: string;
  num_for_sale: number;
  lowest_price: number;
  images: DiscogsImage[];
  genres: string[];
  styles: string[];
  year: number;
  title: string;
  artists: DiscogsArtist[];
  data_quality: string;
}

export interface DiscogsPriceSuggestion {
  'Mint (M)'?: {
    currency: string;
    value: number;
  };
  'Near Mint (NM or M-)'?: {
    currency: string;
    value: number;
  };
  'Very Good Plus (VG+)'?: {
    currency: string;
    value: number;
  };
  'Very Good (VG)'?: {
    currency: string;
    value: number;
  };
  'Good Plus (G+)'?: {
    currency: string;
    value: number;
  };
  'Good (G)'?: {
    currency: string;
    value: number;
  };
  'Fair (F)'?: {
    currency: string;
    value: number;
  };
  'Poor (P)'?: {
    currency: string;
    value: number;
  };
}

export interface DiscogsMarketplaceListing {
  id: number;
  resource_url: string;
  uri: string;
  status: string;
  price: {
    value: number;
    currency: string;
  };
  condition: string;
  sleeve_condition: string;
  posted: string;
  ships_from: string;
  seller: {
    username: string;
    resource_url: string;
    stats: {
      rating: string;
      stars: number;
      total: number;
    };
  };
}

export interface DiscogsCollectionFolder {
  id: number;
  name: string;
  count: number;
  resource_url: string;
}

export interface DiscogsCollectionItem {
  id: number;
  instance_id: number;
  folder_id: number;
  rating: number;
  basic_information: {
    id: number;
    title: string;
    year: number;
    resource_url: string;
    thumb: string;
    cover_image: string;
    formats: DiscogsFormat[];
    labels: DiscogsLabel[];
    artists: DiscogsArtist[];
    genres: string[];
    styles: string[];
  };
  notes?: {
    field_id: number;
    value: string;
  }[];
  date_added: string;
}

export interface DiscogsSearchResult {
  id: number;
  type: 'release' | 'master' | 'artist' | 'label';
  title: string;
  resource_url: string;
  uri: string;
  thumb: string;
  cover_image: string;
  country?: string;
  year?: string;
  format?: string[];
  label?: string[];
  genre?: string[];
  style?: string[];
  barcode?: string[];
  catno?: string;
}

export interface DiscogsPagination {
  page: number;
  pages: number;
  per_page: number;
  items: number;
  urls: {
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  };
}

export interface DiscogsCollectionResponse {
  pagination: DiscogsPagination;
  releases: DiscogsCollectionItem[];
}

export interface DiscogsSearchResponse {
  pagination: DiscogsPagination;
  results: DiscogsSearchResult[];
}

export interface DiscogsUser {
  id: number;
  username: string;
  resource_url: string;
  inventory_url: string;
  collection_folders_url: string;
  collection_fields_url: string;
  wantlist_url: string;
  uri: string;
  name: string;
  home_page: string;
  location: string;
  profile: string;
  registered: string;
  num_pending: number;
  num_for_sale: number;
  num_lists: number;
  num_wantlist: number;
  num_collection: number;
  releases_contributed: number;
  rank: number;
  releases_rated: number;
  rating_avg: number;
  avatar_url: string;
}

export interface DiscogsRateLimitStatus {
  limit: number;
  used: number;
  remaining: number;
}

export interface DiscogsAPIError {
  message: string;
  statusCode: number;
  rateLimitRemaining?: number;
}
