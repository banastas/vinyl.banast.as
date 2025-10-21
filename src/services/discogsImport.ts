import type { Vinyl, VinylCondition, Artist } from '../types/Vinyl';
import type {
  DiscogsRelease,
  DiscogsCollectionItem,
  DiscogsPriceSuggestion,
} from '../types/Discogs';
import { discogsClient } from './discogsClient';

/**
 * Map Discogs condition to our VinylCondition type
 */
function mapDiscogsCondition(condition: string): VinylCondition {
  const conditionMap: Record<string, VinylCondition> = {
    'Mint (M)': 'Mint (M)',
    'Near Mint (NM)': 'Near Mint (NM)',
    'Near Mint (NM or M-)': 'Near Mint (NM)',
    'Very Good Plus (VG+)': 'Very Good Plus (VG+)',
    'Very Good (VG)': 'Very Good (VG)',
    'Good Plus (G+)': 'Good Plus (G+)',
    'Good (G)': 'Good (G)',
    'Fair (F)': 'Fair (F)',
    'Poor (P)': 'Poor (P)',
  };

  return conditionMap[condition] || 'Very Good (VG)';
}

/**
 * Map Discogs artists to our Artist type
 */
function mapDiscogsArtists(discogsArtists: any[]): Artist[] {
  return discogsArtists.map(artist => ({
    id: artist.id,
    name: artist.name,
    role: artist.role,
  }));
}

/**
 * Get estimated value from price suggestions based on condition
 */
function getEstimatedValue(
  prices: DiscogsPriceSuggestion,
  condition: VinylCondition
): number | undefined {
  const conditionKey = condition as keyof DiscogsPriceSuggestion;
  const priceData = prices[conditionKey];
  return priceData?.value;
}

/**
 * Map a Discogs release to our Vinyl type
 */
export function mapDiscogsReleaseToVinyl(
  release: DiscogsRelease,
  collectionItem?: DiscogsCollectionItem,
  prices?: DiscogsPriceSuggestion
): Omit<Vinyl, 'id' | 'createdAt' | 'updatedAt'> {
  const primaryArtist = release.artists?.[0]?.name || 'Unknown Artist';
  const artists = mapDiscogsArtists(release.artists || []);
  const label = release.labels?.[0]?.name || '';
  const catalogNumber = release.labels?.[0]?.catno || '';
  const format = release.formats?.[0]?.descriptions || [release.formats?.[0]?.name || 'LP'];

  // Default to Near Mint for new imports
  const mediaCondition: VinylCondition = 'Near Mint (NM)';
  const sleeveCondition: VinylCondition = 'Near Mint (NM)';

  // Get cover image
  const coverImage = release.images?.find(img => img.type === 'primary')?.uri ||
                    release.images?.[0]?.uri ||
                    release.thumb ||
                    '';

  // Calculate estimated value from prices if available
  const estimatedValue = prices ? getEstimatedValue(prices, mediaCondition) : undefined;

  return {
    discogsReleaseId: release.id,
    discogsMasterId: release.master_id,
    artist: primaryArtist,
    artists: artists,
    title: release.title,
    label: label,
    catalogNumber: catalogNumber,
    releaseYear: release.year || new Date().getFullYear(),
    country: release.country || '',
    format: Array.isArray(format) ? format : [format],
    genres: release.genres || [],
    styles: release.styles || [],
    coverImageUrl: coverImage,
    sleeveCondition: sleeveCondition,
    mediaCondition: mediaCondition,
    purchaseDate: collectionItem?.date_added || new Date().toISOString(),
    purchaseCurrency: 'USD',
    storageLocation: '',
    tags: [],
    notes: release.notes || '',
    suggestedPrice: estimatedValue,
    estimatedValue: estimatedValue,
    lastPriceUpdate: prices ? new Date().toISOString() : undefined,
    lastSyncedWithDiscogs: new Date().toISOString(),
  };
}

/**
 * Import a user's Discogs collection
 */
export async function importDiscogsCollection(
  username: string,
  folderId: number = 0,
  onProgress?: (current: number, total: number, item: string) => void
): Promise<Omit<Vinyl, 'id' | 'createdAt' | 'updatedAt'>[]> {
  const vinyls: Omit<Vinyl, 'id' | 'createdAt' | 'updatedAt'>[] = [];
  let page = 1;
  let hasMore = true;
  let totalProcessed = 0;

  while (hasMore) {
    const response = await discogsClient.getUserCollectionReleases(username, folderId, {
      page,
      per_page: 100,
    });

    for (const item of response.releases) {
      try {
        onProgress?.(
          totalProcessed + 1,
          response.pagination.items,
          `${item.basic_information.artists[0]?.name} - ${item.basic_information.title}`
        );

        // Get full release details
        const release = await discogsClient.getRelease(item.basic_information.id);

        // Get price suggestions
        let prices: DiscogsPriceSuggestion | undefined;
        try {
          prices = await discogsClient.getPriceSuggestions(item.basic_information.id);
        } catch (error) {
          console.warn(`Could not fetch prices for ${item.basic_information.id}`, error);
        }

        // Map to vinyl
        const vinyl = mapDiscogsReleaseToVinyl(release, item, prices);
        vinyls.push(vinyl);

        totalProcessed++;

        // Small delay to respect rate limits
        await sleep(250);
      } catch (error) {
        console.error(`Failed to import release ${item.basic_information.id}`, error);
      }
    }

    hasMore = response.pagination.page < response.pagination.pages;
    page++;
  }

  return vinyls;
}

/**
 * Update prices for multiple vinyls
 */
export async function updateVinylPrices(
  vinyls: Vinyl[],
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, DiscogsPriceSuggestion>> {
  const pricesMap = new Map<string, DiscogsPriceSuggestion>();
  const vinylsWithDiscogsId = vinyls.filter(v => v.discogsReleaseId);

  for (let i = 0; i < vinylsWithDiscogsId.length; i++) {
    const vinyl = vinylsWithDiscogsId[i];
    onProgress?.(i + 1, vinylsWithDiscogsId.length);

    try {
      if (vinyl.discogsReleaseId) {
        const prices = await discogsClient.getPriceSuggestions(vinyl.discogsReleaseId);
        pricesMap.set(vinyl.id, prices);

        // Delay to respect rate limits
        await sleep(250);
      }
    } catch (error) {
      console.error(`Failed to update prices for ${vinyl.title}`, error);
    }
  }

  return pricesMap;
}

/**
 * Search Discogs and return results ready for import
 */
export async function searchDiscogsForImport(
  query: string,
  options?: {
    artist?: string;
    label?: string;
    year?: string;
    format?: string;
  }
) {
  const results = await discogsClient.searchReleases(query, {
    type: 'release',
    ...options,
  });

  return results.results;
}

/**
 * Get a single release ready for import
 */
export async function getDiscogsReleaseForImport(releaseId: number) {
  const release = await discogsClient.getRelease(releaseId);
  let prices: DiscogsPriceSuggestion | undefined;

  try {
    prices = await discogsClient.getPriceSuggestions(releaseId);
  } catch (error) {
    console.warn(`Could not fetch prices for ${releaseId}`, error);
  }

  return mapDiscogsReleaseToVinyl(release, undefined, prices);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
