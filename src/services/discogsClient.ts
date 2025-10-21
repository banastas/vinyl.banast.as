import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  DiscogsRelease,
  DiscogsMaster,
  DiscogsPriceSuggestion,
  DiscogsCollectionResponse,
  DiscogsSearchResponse,
  DiscogsUser,
  DiscogsRateLimitStatus,
  DiscogsAPIError,
  DiscogsMarketplaceListing,
} from '../types/Discogs';

interface RequestQueueItem {
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class DiscogsClient {
  private axiosInstance: AxiosInstance;
  private token: string = '';
  private username: string = '';
  private rateLimitStatus: DiscogsRateLimitStatus = {
    limit: 60,
    used: 0,
    remaining: 60,
  };
  private requestQueue: RequestQueueItem[] = [];
  private isProcessingQueue = false;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = {
    METADATA: 7 * 24 * 60 * 60 * 1000, // 7 days
    PRICES: 24 * 60 * 60 * 1000, // 24 hours
  };

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.discogs.com',
      headers: {
        'User-Agent': 'VinylBanastAs/1.0 +https://vinyl.banast.as',
      },
    });

    // Add response interceptor to track rate limits
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (response.headers['x-discogs-ratelimit']) {
          this.rateLimitStatus = {
            limit: parseInt(response.headers['x-discogs-ratelimit'], 10),
            used: parseInt(response.headers['x-discogs-ratelimit-used'], 10),
            remaining: parseInt(response.headers['x-discogs-ratelimit-remaining'], 10),
          };
        }
        return response;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Authenticate with Personal Access Token
   */
  authenticate(token: string, username: string): void {
    this.token = token;
    this.username = username;
    this.axiosInstance.defaults.headers.common['Authorization'] = `Discogs token=${token}`;
    this.rateLimitStatus.limit = 240; // Authenticated users get higher limits
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): DiscogsRateLimitStatus {
    return { ...this.rateLimitStatus };
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cached data if valid
   */
  private getCachedData<T>(key: string, ttl: number): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data as T;
    }
    return null;
  }

  /**
   * Set cached data
   */
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Handle API errors with retry logic
   */
  private async handleRequest<T>(
    requestFn: () => Promise<T>,
    retries = 3
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;

      if (statusCode === 429) {
        // Rate limited - wait and retry
        const waitTime = this.rateLimitStatus.remaining === 0 ? 60000 : 5000;
        await this.sleep(waitTime);

        if (retries > 0) {
          return this.handleRequest(requestFn, retries - 1);
        }
      }

      if (statusCode >= 500 && retries > 0) {
        // Server error - retry with exponential backoff
        await this.sleep(Math.pow(2, 3 - retries) * 1000);
        return this.handleRequest(requestFn, retries - 1);
      }

      const discogsError: DiscogsAPIError = {
        message: axiosError.message,
        statusCode,
        rateLimitRemaining: this.rateLimitStatus.remaining,
      };

      throw discogsError;
    }
  }

  /**
   * Queue a request to respect rate limits
   */
  private async queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ fn: requestFn, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process the request queue with rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      // Check if we're approaching rate limit
      if (this.rateLimitStatus.remaining < 5) {
        await this.sleep(1000);
        continue;
      }

      const item = this.requestQueue.shift();
      if (!item) break;

      try {
        const result = await this.handleRequest(item.fn);
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }

      // Small delay between requests (4 req/sec max for authenticated)
      await this.sleep(250);
    }

    this.isProcessingQueue = false;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get user information
   */
  async getUser(username?: string): Promise<DiscogsUser> {
    const user = username || this.username;
    const cacheKey = `user:${user}`;
    const cached = this.getCachedData<DiscogsUser>(cacheKey, this.CACHE_TTL.METADATA);

    if (cached) return cached;

    const response = await this.queueRequest(() =>
      this.axiosInstance.get<DiscogsUser>(`/users/${user}`)
    );

    this.setCachedData(cacheKey, response.data);
    return response.data;
  }

  /**
   * Get user's collection folders
   */
  async getUserCollectionFolders(username?: string) {
    const user = username || this.username;
    const response = await this.queueRequest(() =>
      this.axiosInstance.get(`/users/${user}/collection/folders`)
    );
    return response.data.folders;
  }

  /**
   * Get releases from a collection folder
   */
  async getUserCollectionReleases(
    username?: string,
    folderId: number = 0,
    options: { page?: number; per_page?: number } = {}
  ): Promise<DiscogsCollectionResponse> {
    const user = username || this.username;
    const { page = 1, per_page = 100 } = options;

    const response = await this.queueRequest(() =>
      this.axiosInstance.get<DiscogsCollectionResponse>(
        `/users/${user}/collection/folders/${folderId}/releases`,
        { params: { page, per_page, sort: 'added', sort_order: 'desc' } }
      )
    );

    return response.data;
  }

  /**
   * Get full release details
   */
  async getRelease(releaseId: number): Promise<DiscogsRelease> {
    const cacheKey = `release:${releaseId}`;
    const cached = this.getCachedData<DiscogsRelease>(cacheKey, this.CACHE_TTL.METADATA);

    if (cached) return cached;

    const response = await this.queueRequest(() =>
      this.axiosInstance.get<DiscogsRelease>(`/releases/${releaseId}`)
    );

    this.setCachedData(cacheKey, response.data);
    return response.data;
  }

  /**
   * Get master release details
   */
  async getMasterRelease(masterId: number): Promise<DiscogsMaster> {
    const cacheKey = `master:${masterId}`;
    const cached = this.getCachedData<DiscogsMaster>(cacheKey, this.CACHE_TTL.METADATA);

    if (cached) return cached;

    const response = await this.queueRequest(() =>
      this.axiosInstance.get<DiscogsMaster>(`/masters/${masterId}`)
    );

    this.setCachedData(cacheKey, response.data);
    return response.data;
  }

  /**
   * Get price suggestions for a release
   */
  async getPriceSuggestions(releaseId: number): Promise<DiscogsPriceSuggestion> {
    const cacheKey = `price:${releaseId}`;
    const cached = this.getCachedData<DiscogsPriceSuggestion>(cacheKey, this.CACHE_TTL.PRICES);

    if (cached) return cached;

    const response = await this.queueRequest(() =>
      this.axiosInstance.get<DiscogsPriceSuggestion>(
        `/marketplace/price_suggestions/${releaseId}`
      )
    );

    this.setCachedData(cacheKey, response.data);
    return response.data;
  }

  /**
   * Get marketplace listings for a release
   */
  async getMarketplaceListings(releaseId: number): Promise<DiscogsMarketplaceListing[]> {
    const response = await this.queueRequest(() =>
      this.axiosInstance.get(`/marketplace/listings`,
        { params: { release_id: releaseId } }
      )
    );
    return response.data.listings || [];
  }

  /**
   * Search the Discogs database
   */
  async searchReleases(query: string, options: {
    type?: 'release' | 'master' | 'artist' | 'label';
    artist?: string;
    label?: string;
    year?: string;
    format?: string;
    genre?: string;
    style?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<DiscogsSearchResponse> {
    const { page = 1, per_page = 50, ...searchParams } = options;

    const response = await this.queueRequest(() =>
      this.axiosInstance.get<DiscogsSearchResponse>('/database/search', {
        params: {
          q: query,
          ...searchParams,
          page,
          per_page,
        },
      })
    );

    return response.data;
  }

  /**
   * Get collection value
   */
  async getCollectionValue(username?: string): Promise<number> {
    const user = username || this.username;
    const response = await this.queueRequest(() =>
      this.axiosInstance.get(`/users/${user}/collection/value`)
    );
    return response.data.minimum || 0;
  }
}

// Export singleton instance
export const discogsClient = new DiscogsClient();
export default discogsClient;
