export type VinylCondition =
  | 'Mint (M)'
  | 'Near Mint (NM)'
  | 'Very Good Plus (VG+)'
  | 'Very Good (VG)'
  | 'Good Plus (G+)'
  | 'Good (G)'
  | 'Fair (F)'
  | 'Poor (P)';

export interface Artist {
  id: number;                        // Discogs artist ID
  name: string;
  role?: string;                     // e.g., "featuring", "remix"
}

export interface Vinyl {
  // Discogs identifiers
  id: string;                        // Internal ID
  discogsReleaseId?: number;         // Discogs release ID
  discogsMasterId?: number;          // Discogs master release ID

  // Basic information
  artist: string;                    // Primary artist name
  artists: Artist[];                 // All artists on release
  title: string;                     // Album/release title
  label: string;                     // Record label
  catalogNumber: string;             // Catalog number
  releaseYear: number;               // Year of release
  country: string;                   // Country of release
  format: string[];                  // e.g., ["LP", "Album", "180g"]
  genres: string[];                  // Genre tags
  styles: string[];                  // Style tags

  // Physical details
  coverImageUrl: string;             // Cover art URL
  sleeveCondition: VinylCondition;   // Sleeve/jacket condition
  mediaCondition: VinylCondition;    // Vinyl/media condition
  pressNumber?: string;              // Pressing number/variant
  colorVariant?: string;             // Colored vinyl description
  weight?: string;                   // e.g., "180g"

  // Collection metadata
  purchasePrice?: number;            // What you paid
  purchaseDate: string;              // When you bought it
  purchaseCurrency: string;          // Original currency (default USD)
  storageLocation: string;           // Physical location
  tags: string[];                    // Custom tags
  notes: string;                     // Personal notes

  // Market data (from Discogs API)
  currentLowestPrice?: number;       // Current lowest marketplace price
  currentMedianPrice?: number;       // Median marketplace price
  currentHighestPrice?: number;      // Current highest marketplace price
  suggestedPrice?: number;           // Discogs price suggestion
  lastPriceUpdate?: string;          // When prices were last fetched

  // Performance tracking
  estimatedValue?: number;           // Best estimate of current value
  gainLoss?: number;                 // Calculated gain/loss
  gainLossPercentage?: number;       // Percentage change

  // Metadata
  createdAt: string;
  updatedAt: string;
  lastSyncedWithDiscogs?: string;    // Last Discogs API sync
}

export interface VinylStats {
  // Collection totals
  totalRecords: number;
  totalValue: number;
  totalPurchaseValue: number;
  totalCurrentValue: number;

  // Top performers
  highestValuedRecord: Vinyl | null;
  biggestGainer: Vinyl | null;
  biggestLoser: Vinyl | null;

  // Condition breakdown
  mintRecords: number;
  nearMintRecords: number;
  veryGoodPlusRecords: number;
  veryGoodRecords: number;
  goodPlusRecords: number;
  goodRecords: number;
  fairRecords: number;
  poorRecords: number;

  // Format breakdown
  lpCount: number;
  epCount: number;
  singleCount: number;
  otherFormatCount: number;

  // Collection insights
  averageSleeveCondition: string;
  averageMediaCondition: string;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  recordsWithCurrentValue: number;

  // Special categories
  coloredVinylCount: number;
  firstPressingCount: number;
  limitedEditionCount: number;
}

export type SortField =
  | 'artist'
  | 'title'
  | 'releaseYear'
  | 'purchaseDate'
  | 'purchasePrice'
  | 'estimatedValue'
  | 'gainLoss'
  | 'gainLossPercentage'
  | 'sleeveCondition'
  | 'mediaCondition';

export type SortDirection = 'asc' | 'desc';

export interface FilterOptions {
  searchTerm: string;
  artist: string;
  label: string;
  genres: string[];
  formats: string[];
  minSleeveCondition: VinylCondition | '';
  maxSleeveCondition: VinylCondition | '';
  minMediaCondition: VinylCondition | '';
  maxMediaCondition: VinylCondition | '';
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  country: string;
  tags: string[];
  storageLocation: string;
  coloredVinylOnly: boolean;
  firstPressingOnly: boolean;
}
