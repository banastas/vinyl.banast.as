# Product Requirements Document: vinyl.banast.as

## Executive Summary

Create a vinyl record collection manager at `vinyl.banast.as` based on the existing `comics.banast.as` codebase, integrating the Discogs API to provide real-time collection value tracking, marketplace pricing data, and comprehensive record metadata.

## Project Overview

### Vision
A modern, responsive web application for managing and tracking vinyl record collections with real-time market value data, advanced analytics, financial tracking, and comprehensive organization features powered by the Discogs API.

### Goals
- Adapt the proven comics.banast.as architecture for vinyl record management
- Integrate Discogs API for automated metadata, cover art, and pricing data
- Provide real-time collection value tracking using marketplace data
- Enable seamless collection management with Discogs account synchronization
- Maintain the mobile-first, responsive design philosophy
- Deliver advanced analytics specific to vinyl collecting

## Target Audience

Vinyl record collectors who want to:
- Track their entire collection digitally with official Discogs data
- Monitor collection value and individual record prices in real-time
- Analyze collection trends and financial performance
- Search and filter records easily
- Access their collection on any device
- Sync with their Discogs collection
- Organize with custom tags, storage locations, and condition grades

## Technical Foundation

### Base Architecture
- **Clone from**: comics.banast.as codebase
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite with optimized code splitting
- **Styling**: Tailwind CSS with custom responsive utilities
- **State Management**: Zustand
- **Icons**: Lucide React
- **Validation**: Zod schemas for data validation
- **Performance**: Lazy loading, code splitting, responsive images

### New Integration
- **External API**: Discogs API v2.0
- **API Client**: Custom TypeScript client for Discogs
- **Authentication**: OAuth 1.0a for full user access + Personal Access Tokens
- **Rate Limiting**: Handle 60 requests/minute (unauthenticated) or 240 requests/minute (authenticated)
- **Caching Strategy**: Local caching with configurable TTL to minimize API calls

## Core Features

### 1. Collection Management

#### Record Data Model
Transform from Comic interface to Vinyl interface:

```typescript
interface Vinyl {
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

type VinylCondition = 'Mint (M)' | 'Near Mint (NM)' | 'Very Good Plus (VG+)' | 'Very Good (VG)' | 'Good Plus (G+)' | 'Good (G)' | 'Fair (F)' | 'Poor (P)';

interface Artist {
  id: number;                        // Discogs artist ID
  name: string;
  role?: string;                     // e.g., "featuring", "remix"
}
```

#### Comprehensive Record Details
Track all essential vinyl metadata:
- Artist(s), album title, label, catalog number
- Release year, country, format details
- Sleeve and media condition (Goldmine standard)
- Pressing variants, colored vinyl, weight
- Purchase price, date, and original currency
- Current market value from Discogs marketplace
- Storage location, custom tags, personal notes

#### Cover Art Display
- Visual grid with album cover thumbnails
- High-resolution cover images from Discogs
- Graceful fallbacks for missing artwork
- Responsive image loading with WebP support

#### Condition Tracking
- Separate sleeve and media condition grades
- Goldmine grading standard (M, NM, VG+, VG, G+, G, F, P)
- Condition-specific value estimates
- Visual indicators for condition

### 2. Discogs API Integration

#### Authentication Options

**Option 1: Personal Access Token (Simple)**
- Generate token from Discogs developer settings
- Store securely in app config/environment
- Use for read-only collection access
- Ideal for personal use

**Option 2: OAuth 1.0a (Full Featured)**
- Implement full OAuth flow for user authentication
- Allow users to connect their own Discogs accounts
- Enable read/write access to Discogs collection
- Support multi-user scenarios

**Recommended Approach**: Start with Personal Access Token for MVP, add OAuth for multi-user support in v2.

#### Core API Endpoints to Integrate

**Collection Endpoints**
```
GET /users/{username}/collection/folders
GET /users/{username}/collection/folders/{folder_id}/releases
POST /users/{username}/collection/folders/{folder_id}/releases/{release_id}
DELETE /users/{username}/collection/folders/{folder_id}/releases/{release_id}/instances/{instance_id}
```

**Release & Pricing Endpoints**
```
GET /releases/{release_id}
GET /marketplace/price_suggestions/{release_id}
GET /masters/{master_id}
GET /database/search
```

**User Endpoints**
```
GET /users/{username}
GET /users/{username}/collection/value
```

#### API Features

**Metadata Enrichment**
- Fetch complete release details by Discogs ID
- Auto-populate artist, title, label, format, genres
- Download official cover art
- Retrieve tracklisting and credits

**Price Data Sync**
- Fetch price suggestions for each release
- Get condition-specific pricing (M, NM, VG+, etc.)
- Update prices on configurable schedule (daily/weekly)
- Calculate collection value in real-time
- Support multiple currencies with conversion

**Collection Sync**
- One-click import from Discogs collection
- Bi-directional sync (optional)
- Merge local data with Discogs metadata
- Conflict resolution for manual edits

**Search & Discovery**
- Search Discogs database for new releases
- Add records directly from search results
- Barcode/catalog number lookup
- Artist/label browsing

#### Rate Limiting & Caching

**Rate Limit Handling**
- Implement exponential backoff on rate limit errors
- Queue API requests to stay within limits
- Display rate limit status to user
- Authenticated: 240 requests/min (4 req/sec)
- Unauthenticated: 60 requests/min (1 req/sec)

**Caching Strategy**
- Cache release metadata locally (TTL: 7 days)
- Cache price data locally (TTL: 24 hours)
- Cache cover images permanently
- Manual refresh option per record or full collection
- Background sync queue for bulk updates

**API Response Headers to Monitor**
```
X-Discogs-Ratelimit: 240
X-Discogs-Ratelimit-Used: 5
X-Discogs-Ratelimit-Remaining: 235
```

### 3. Advanced Analytics & Dashboard

#### Dashboard Overview Stats
Adapt comic stats to vinyl:

```typescript
interface VinylStats {
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
  // ... other conditions

  // Format breakdown
  lpCount: number;
  epCount: number;
  singleCount: number;
  // ... other formats

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
```

#### Dashboard Cards
- Total Records count
- Total Collection Value (with real-time Discogs data)
- Total Purchase Value
- Total Gain/Loss ($ and %)
- Average Sleeve Condition
- Average Media Condition
- Condition Breakdown (clickable)
- Format Breakdown (LP, EP, 7", etc.)
- Genre Distribution
- Label Statistics
- Storage Location Summary

#### Performance Analytics
- Biggest Gainers (top 10 records by $ increase)
- Biggest Losers (records losing value)
- Value Trends Over Time (chart)
- Artist Performance (which artists appreciate most)
- Label Performance
- Genre Performance
- Decade Performance (60s, 70s, 80s, etc.)

#### Collection Insights
- Most Collected Artists
- Most Collected Labels
- Most Valuable Genre
- Average Record Value
- Collection Completion Percentage (for artists/series)
- Rarest Records (based on Discogs marketplace data)

### 4. Search, Filter & Sort

#### Search Capabilities
Transform comic search to vinyl:
- **Full-Text Search**: Artist, album title, label, catalog number, notes
- **Advanced Filters**:
  - Artist name
  - Label
  - Genre(s)
  - Format (LP, EP, Single, etc.)
  - Sleeve condition range
  - Media condition range
  - Price range
  - Year range
  - Country of release
  - Custom tags
  - Storage location
  - Colored vinyl only
  - First pressing only

#### Sort Options
- Artist (A-Z)
- Album Title (A-Z)
- Release Year (newest/oldest)
- Purchase Date (newest/oldest)
- Purchase Price (high/low)
- Current Value (high/low)
- Gain/Loss Amount (best/worst)
- Gain/Loss Percentage (best/worst)
- Sleeve Condition (best/worst)
- Media Condition (best/worst)

#### View Modes
- **Grid View**: Album covers in responsive grid
- **List View**: Detailed table with all metadata
- **Compact View**: Dense list for mobile

### 5. Detail Pages

#### Individual Record Detail
Navigate to `/record/{id}`:
- Large cover image
- All release metadata
- Condition details
- Purchase information
- Current market value with price history
- Gain/loss calculation
- Link to Discogs release page
- Tracklisting (from Discogs API)
- Credits (from Discogs API)
- Marketplace activity chart
- Similar records in collection
- Edit/Delete actions

#### Artist Detail Page
Navigate to `/artist/{name}`:
- All records by artist in collection
- Artist statistics (total value, count, avg condition)
- Discogs artist bio and image
- Artist performance over time
- Highest valued release
- Latest additions

#### Label Detail Page
Navigate to `/label/{name}`:
- All records from label
- Label statistics
- Discogs label information
- Label performance

#### Genre/Style Detail Page
Navigate to `/genre/{name}`:
- All records in genre
- Genre statistics
- Top artists in genre
- Value distribution

#### Storage Location Detail Page
Navigate to `/storage/{location}`:
- All records in location
- Location statistics
- Quick move functionality
- Value concentration

### 6. Discogs Collection Sync

#### One-Click Import
- "Import from Discogs" button in header
- OAuth authentication flow
- Select folders to import
- Progress indicator for bulk import
- Map Discogs fields to local fields
- Handle rate limits gracefully
- Import all release metadata and current market values

#### Sync Options
- **One-Time Import**: Import once, manage locally
- **Auto-Sync**: Periodically sync with Discogs collection
- **Manual Sync**: Refresh button per record or full collection
- **Conflict Resolution**: Choose between local or Discogs data

#### Sync Settings
- Sync frequency (never, daily, weekly, monthly)
- What to sync (metadata only, prices only, both)
- Override local data (yes/no)
- Folders to sync (all or selected)

### 7. Price Tracking & Alerts

#### Real-Time Value Updates
- Fetch latest marketplace prices on schedule
- Display last update timestamp
- Manual refresh per record
- Bulk refresh entire collection
- Visual indicators for price changes

#### Value History
- Store historical price snapshots
- Chart value over time per record
- Collection value trends
- Export value history to CSV

#### Price Alerts (Future Enhancement)
- Set target sell price for records
- Alert when record reaches value threshold
- Notify on significant value changes (>10%, >$X)
- Weekly value summary email

### 8. Data Management

#### Import Options
**From Discogs**
- OAuth-based collection import
- Search and add individual releases
- Bulk import by Discogs username

**From CSV**
- CSV to JSON converter (adapted from comics app)
- Template CSV with vinyl-specific fields
- Drag-and-drop upload interface
- Data validation with Zod schemas

**Manual Entry**
- Add record form with all fields
- Discogs search integration in form
- Auto-fill from Discogs ID
- Barcode/catalog number lookup

#### Export Options
- Export to JSON
- Export to CSV
- Export to Discogs collection (via API)
- Backup entire collection
- Generate collection report (PDF)

#### Data Validation
Update Zod schemas for vinyl:
```typescript
const VinylSchema = z.object({
  id: z.string(),
  discogsReleaseId: z.number().optional(),
  artist: z.string().min(1),
  title: z.string().min(1),
  label: z.string(),
  catalogNumber: z.string(),
  releaseYear: z.number().min(1900).max(new Date().getFullYear() + 1),
  sleeveCondition: z.enum(['Mint (M)', 'Near Mint (NM)', 'Very Good Plus (VG+)', 'Very Good (VG)', 'Good Plus (G+)', 'Good (G)', 'Fair (F)', 'Poor (P)']),
  mediaCondition: z.enum(['Mint (M)', 'Near Mint (NM)', 'Very Good Plus (VG+)', 'Very Good (VG)', 'Good Plus (G+)', 'Good (G)', 'Fair (F)', 'Poor (P)']),
  purchasePrice: z.number().min(0).optional(),
  purchaseDate: z.string(),
  genres: z.array(z.string()),
  styles: z.array(z.string()),
  // ... additional fields
});
```

### 9. Responsive Design

Maintain comics.banast.as responsive philosophy:
- **Mobile-First**: Optimized from 320px to 4K
- **Touch-Friendly**: Minimum 44px touch targets
- **Fluid Typography**: Scales across devices
- **Responsive Images**: Optimized album covers
- **Grid Layouts**: Responsive album cover grids
- **Collapsible Filters**: Mobile-friendly filter UI
- **Bottom Navigation**: Mobile navigation bar

### 10. Performance

#### Optimization Strategies
- **Code Splitting**: Lazy-load detail pages
- **Image Optimization**: WebP covers with lazy loading
- **API Request Batching**: Batch Discogs API calls
- **Infinite Scroll**: Virtualized large collections
- **Service Worker**: Cache Discogs responses (PWA)
- **Debounced Search**: Reduce search re-renders

#### Performance Budgets
- JavaScript Bundle: <300KB gzipped
- CSS Bundle: <50KB gzipped
- Cover Images: WebP format, responsive sizes
- API Response Time: Cache to <100ms
- Time to Interactive: <3s

## Technical Implementation

### Phase 1: Foundation (Week 1-2)

**Clone & Setup**
- Clone comics.banast.as repository
- Rename project to vinyl.banast.as
- Update package.json metadata
- Update README with vinyl-specific info
- Set up new repository

**Data Model Migration**
- Create Vinyl interface
- Create VinylStats interface
- Update validation schemas
- Create sample vinyl data JSON
- Update TypeScript types throughout

**Component Renaming**
- Comic → Vinyl throughout codebase
- Update all component names
- Update all file names
- Update all imports
- Update UI text and labels

### Phase 2: Discogs API Client (Week 3)

**API Client Setup**
- Create Discogs API client service
- Implement authentication (Personal Access Token first)
- Create TypeScript types for Discogs responses
- Implement rate limiting logic
- Add request queue system
- Implement caching layer

**Core API Methods**
```typescript
class DiscogsClient {
  // Authentication
  authenticate(token: string): Promise<void>;

  // Collection
  getUserCollection(username: string, folderId?: number): Promise<DiscogsRelease[]>;
  getCollectionValue(username: string): Promise<number>;

  // Releases
  getRelease(releaseId: number): Promise<DiscogsRelease>;
  getMasterRelease(masterId: number): Promise<DiscogsMaster>;
  searchReleases(query: string): Promise<DiscogsSearchResult[]>;

  // Pricing
  getPriceSuggestions(releaseId: number): Promise<PriceSuggestion[]>;
  getMarketplaceListings(releaseId: number): Promise<MarketplaceListing[]>;

  // Helpers
  getRateLimitStatus(): RateLimitStatus;
  clearCache(): void;
}
```

### Phase 3: Core Features (Week 4-5)

**Dashboard Updates**
- Update Dashboard component with vinyl stats
- Create vinyl-specific stat calculations
- Add Discogs sync status indicator
- Update all chart/graph components

**Collection Display**
- Update grid view for album covers
- Update list view with vinyl fields
- Add condition indicators
- Add price change indicators
- Update sorting/filtering logic

**Detail Pages**
- Update record detail page
- Create artist detail page
- Create label detail page
- Create genre detail page
- Create storage detail page
- Add Discogs API data to all pages

### Phase 4: Discogs Integration (Week 6)

**Import Flow**
- Create Discogs import wizard
- Implement OAuth flow (if using OAuth)
- Create collection sync UI
- Add progress indicators
- Handle errors gracefully

**Price Updates**
- Create price update service
- Schedule automatic updates
- Add manual refresh buttons
- Show price history
- Calculate gain/loss

**Search Integration**
- Add Discogs search to add record form
- Auto-fill from Discogs data
- Preview release before adding
- Handle multiple pressings

### Phase 5: Polish & Deploy (Week 7-8)

**Testing**
- Unit tests for Discogs client
- Integration tests for API flows
- E2E tests for critical paths
- Performance testing with large collections
- Mobile device testing

**Documentation**
- Update README for vinyl collectors
- Create Discogs API setup guide
- Document rate limiting behavior
- Create user guide
- Add troubleshooting section

**Deployment**
- Set up vinyl.banast.as subdomain
- Configure environment variables
- Deploy to hosting (Netlify/Vercel)
- Set up monitoring
- Configure caching

## User Stories

### As a vinyl collector, I want to...

1. **Import my Discogs collection** so I can quickly get started without manual entry
2. **See real-time market values** for my records so I know what my collection is worth
3. **Track which records gained value** so I can make informed selling decisions
4. **Search my collection by artist, album, or label** so I can quickly find records
5. **View my collection on my phone** so I can check what I own while record shopping
6. **Track sleeve and media condition separately** so I have accurate grading
7. **See which artists I collect most** so I can identify collection patterns
8. **Organize records by storage location** so I can find physical records easily
9. **Add custom tags** so I can organize by my own categories (e.g., "wishlist", "for sale")
10. **Export my collection data** so I have backups and can use data elsewhere
11. **See album cover art** so I can visually browse my collection
12. **Get price updates automatically** so my collection value stays current
13. **Filter by genre or style** so I can explore parts of my collection
14. **Track purchase history** so I know my total investment
15. **See rarest records** based on marketplace activity

## API Integration Specifications

### Authentication Flow

**Personal Access Token (MVP)**
```typescript
// In .env or config
VITE_DISCOGS_TOKEN=your_personal_access_token
VITE_DISCOGS_USERNAME=your_username

// In API client
headers: {
  'Authorization': `Discogs token=${import.meta.env.VITE_DISCOGS_TOKEN}`,
  'User-Agent': 'VinylBanastAs/1.0'
}
```

**OAuth Flow (v2)**
```typescript
// Step 1: Request token
POST https://api.discogs.com/oauth/request_token

// Step 2: User authorizes
Redirect to: https://www.discogs.com/oauth/authorize?oauth_token={token}

// Step 3: Exchange for access token
POST https://api.discogs.com/oauth/access_token

// Step 4: Store tokens
Store oauth_token and oauth_token_secret securely
```

### Data Sync Logic

**Initial Import**
```typescript
async function importDiscogsCollection(username: string) {
  // 1. Get all collection folders
  const folders = await discogs.getUserCollectionFolders(username);

  // 2. For each folder, get releases (paginated)
  for (const folder of folders) {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await discogs.getUserCollectionReleases(
        username,
        folder.id,
        { page, per_page: 100 }
      );

      for (const item of response.releases) {
        // 3. Get full release details
        const release = await discogs.getRelease(item.basic_information.id);

        // 4. Get price suggestions
        const prices = await discogs.getPriceSuggestions(item.basic_information.id);

        // 5. Map to local Vinyl interface
        const vinyl = mapDiscogsToVinyl(release, prices, item);

        // 6. Save to local collection
        await saveVinyl(vinyl);

        // 7. Respect rate limits
        await sleep(250); // 4 requests per second max
      }

      hasMore = response.pagination.page < response.pagination.pages;
      page++;
    }
  }
}
```

**Price Update**
```typescript
async function updateCollectionPrices(vinyls: Vinyl[]) {
  const batchSize = 10;
  const batches = chunk(vinyls, batchSize);

  for (const batch of batches) {
    await Promise.all(batch.map(async (vinyl) => {
      if (!vinyl.discogsReleaseId) return;

      try {
        const prices = await discogs.getPriceSuggestions(vinyl.discogsReleaseId);

        // Update with condition-specific pricing
        vinyl.suggestedPrice = prices[vinyl.mediaCondition];
        vinyl.lastPriceUpdate = new Date().toISOString();

        await updateVinyl(vinyl);
      } catch (error) {
        console.error(`Failed to update prices for ${vinyl.title}`, error);
      }
    }));

    // Respect rate limits between batches
    await sleep(2500); // ~4 req/sec
  }
}
```

### Error Handling

```typescript
class DiscogsAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public rateLimitRemaining?: number
  ) {
    super(message);
  }
}

async function handleDiscogsRequest<T>(
  requestFn: () => Promise<T>,
  retries = 3
): Promise<T> {
  try {
    const response = await requestFn();
    return response;
  } catch (error) {
    if (error.statusCode === 429) {
      // Rate limited - wait and retry
      const waitTime = error.rateLimitRemaining === 0 ? 60000 : 5000;
      await sleep(waitTime);

      if (retries > 0) {
        return handleDiscogsRequest(requestFn, retries - 1);
      }
    }

    if (error.statusCode >= 500 && retries > 0) {
      // Server error - retry with exponential backoff
      await sleep(Math.pow(2, 3 - retries) * 1000);
      return handleDiscogsRequest(requestFn, retries - 1);
    }

    throw error;
  }
}
```

## UI/UX Adaptations

### Color Scheme
Update from comics theme to vinyl theme:
- **Primary**: Deep purple/violet (vinyl record aesthetic)
- **Secondary**: Gold/brass (premium feel)
- **Accent**: Teal/turquoise (modern contrast)
- **Background**: Dark mode with vinyl texture option

### Icons
Update Lucide icons:
- `BookOpen` → `Disc3` (vinyl record icon)
- `Archive` → `Package` (for storage)
- Add `TrendingUp/Down` for price changes
- Add `RefreshCw` for sync actions
- Add `ExternalLink` for Discogs links

### Custom Components

**VinylCard Component**
```typescript
interface VinylCardProps {
  vinyl: Vinyl;
  onView: (vinyl: Vinyl) => void;
  showPriceChange?: boolean;
}

// Shows album cover, artist, title, condition, current value
```

**ConditionBadge Component**
```typescript
interface ConditionBadgeProps {
  condition: VinylCondition;
  type: 'sleeve' | 'media';
}

// Color-coded condition indicator
```

**PriceChangeIndicator Component**
```typescript
interface PriceChangeIndicatorProps {
  oldPrice: number;
  newPrice: number;
  showPercentage?: boolean;
}

// Shows +/- price change with color coding
```

**DiscogsSyncButton Component**
```typescript
interface DiscogsSyncButtonProps {
  onSync: () => Promise<void>;
  lastSyncTime?: string;
  status: 'idle' | 'syncing' | 'error';
}

// Sync button with status and last sync time
```

## Configuration & Environment

### Environment Variables
```env
# Discogs API
VITE_DISCOGS_TOKEN=your_personal_access_token
VITE_DISCOGS_USERNAME=your_username
VITE_DISCOGS_API_URL=https://api.discogs.com

# Optional: OAuth (for multi-user)
VITE_DISCOGS_CONSUMER_KEY=your_consumer_key
VITE_DISCOGS_CONSUMER_SECRET=your_consumer_secret

# Cache settings
VITE_PRICE_CACHE_TTL=86400000  # 24 hours
VITE_METADATA_CACHE_TTL=604800000  # 7 days

# Sync settings
VITE_AUTO_SYNC_ENABLED=false
VITE_AUTO_SYNC_FREQUENCY=daily  # daily, weekly, monthly
```

### App Configuration
```typescript
interface AppConfig {
  discogs: {
    enabled: boolean;
    autoSync: boolean;
    syncFrequency: 'daily' | 'weekly' | 'monthly';
    cacheTTL: {
      prices: number;
      metadata: number;
    };
  };
  currency: {
    default: 'USD';
    supported: string[];
  };
  display: {
    defaultView: 'grid' | 'list';
    itemsPerPage: number;
    showPriceChanges: boolean;
  };
}
```

## Success Metrics

### MVP Success Criteria
- [ ] Successfully import 100+ records from Discogs
- [ ] Display accurate collection value using Discogs pricing
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Sub-3 second load time for collection view
- [ ] Price updates complete within 5 minutes for 100 records
- [ ] Zero data loss during Discogs sync
- [ ] Search returns results in <500ms

### Post-Launch Metrics
- Collection size (number of records managed)
- Active users (if multi-user OAuth implemented)
- API call efficiency (requests per user session)
- Price update frequency (how often users refresh prices)
- Mobile vs desktop usage ratio
- Average session duration
- Most used features (analytics, search, detail views)

## Future Enhancements (Post-MVP)

### Phase 2 Features
1. **OAuth Multi-User Support**: Allow multiple users with their own Discogs accounts
2. **PWA Features**: Offline mode, installable app, push notifications
3. **Advanced Analytics**: Value trends over time, artist performance charts
4. **Price Alerts**: Notify when records reach target values
5. **Wish List**: Track records you want to buy with price tracking
6. **For Sale List**: Mark records for sale with target prices

### Phase 3 Features
1. **Database Backend**: Migrate from JSON to PostgreSQL/Supabase
2. **User Accounts**: Authentication, cloud sync, multi-device
3. **Social Features**: Share collections, compare with friends
4. **Marketplace Integration**: List records for sale on Discogs directly
5. **Barcode Scanner**: Mobile app feature for quick adding
6. **Collection Insurance**: Generate insurance reports with valuations

### Phase 4 Features
1. **AI Recommendations**: Suggest records based on collection
2. **Collection Completion**: Track discography completion by artist
3. **Trading Platform**: Trade records with other users
4. **Record Store Map**: Find local stores with map integration
5. **Collection Analytics Dashboard**: Advanced visualizations
6. **API for Third-Party Apps**: Expose API for integrations

## Risks & Mitigation

### Technical Risks

**Risk**: Discogs API rate limits restrict functionality
- **Mitigation**: Implement aggressive caching, batch requests, queue system
- **Mitigation**: Use Personal Access Token (240 req/min vs 60 unauthenticated)
- **Mitigation**: Allow manual refresh vs auto-refresh to control API usage

**Risk**: Discogs API pricing data unreliable or incomplete
- **Mitigation**: Fall back to manual value entry
- **Mitigation**: Show "last updated" timestamps prominently
- **Mitigation**: Allow user override of suggested prices

**Risk**: Large collections (1000+ records) cause performance issues
- **Mitigation**: Implement virtualization for collection view
- **Mitigation**: Paginate Discogs import process
- **Mitigation**: Use web workers for heavy calculations

**Risk**: OAuth complexity delays MVP
- **Mitigation**: Start with Personal Access Token for single user
- **Mitigation**: Plan OAuth for Phase 2
- **Mitigation**: Design API client to support both methods

### Product Risks

**Risk**: Users expect features not available via Discogs API
- **Mitigation**: Document API limitations clearly
- **Mitigation**: Allow manual data entry as fallback
- **Mitigation**: Prioritize features that API supports

**Risk**: Discogs API changes break integration
- **Mitigation**: Version API client
- **Mitigation**: Comprehensive error handling
- **Mitigation**: Monitor Discogs API announcements
- **Mitigation**: Maintain local data independence

## Dependencies

### External Services
- **Discogs API**: Core dependency for metadata and pricing
- **Image CDN** (optional): For hosting album covers if not using Discogs URLs
- **Hosting**: Netlify, Vercel, or similar for static site

### NPM Packages (additions to comics.banast.as stack)
```json
{
  "oauth-1.0a": "^2.2.6",  // For OAuth if implementing
  "axios": "^1.6.0",  // HTTP client for Discogs API
  "recharts": "^2.10.0",  // Charts for analytics
  "react-query": "^3.39.3",  // API state management & caching
  "currency.js": "^2.0.4"  // Currency handling
}
```

## Documentation Requirements

### User Documentation
- [ ] Getting started guide
- [ ] Discogs API setup instructions
- [ ] Personal Access Token generation guide
- [ ] Collection import walkthrough
- [ ] FAQ section
- [ ] Troubleshooting guide

### Developer Documentation
- [ ] Architecture overview
- [ ] Discogs API client documentation
- [ ] Component library
- [ ] State management guide
- [ ] Deployment guide
- [ ] Contributing guidelines

### API Documentation
- [ ] Discogs endpoints used
- [ ] Rate limiting details
- [ ] Caching strategy
- [ ] Error handling
- [ ] Data mapping (Discogs → Vinyl)

## Timeline & Milestones

### 8-Week Development Plan

**Weeks 1-2: Foundation**
- Clone and adapt codebase
- Update data models
- Rename components
- Create sample data
- Set up development environment

**Week 3: Discogs API Client**
- Build API client service
- Implement authentication
- Create rate limiting
- Add caching layer
- Unit tests

**Weeks 4-5: Core Features**
- Update all components for vinyl
- Implement dashboard analytics
- Update detail pages
- Adapt search/filter/sort
- Responsive design refinements

**Week 6: Discogs Integration**
- Build import flow
- Implement price updates
- Add search integration
- Error handling
- Integration tests

**Weeks 7-8: Polish & Deploy**
- E2E testing
- Performance optimization
- Documentation
- Deployment setup
- Launch vinyl.banast.as

### Post-Launch (Ongoing)
- Monitor Discogs API usage
- Gather user feedback
- Iterate on features
- Plan Phase 2 (OAuth, PWA)

## Conclusion

This PRD outlines a comprehensive plan to adapt the successful comics.banast.as application into a vinyl record collection manager with deep Discogs API integration. By leveraging the proven architecture and adding real-time market data, automated metadata enrichment, and collection sync capabilities, vinyl.banast.as will provide vinyl collectors with a powerful tool to manage and track their collections.

The phased approach prioritizes MVP delivery with Personal Access Token authentication, followed by enhanced features like OAuth multi-user support and advanced analytics. The Discogs API integration provides significant value through automated data entry and real-time pricing while maintaining data independence through local storage and caching.

**Key Differentiators:**
- Real-time collection value tracking via Discogs marketplace data
- One-click import from existing Discogs collections
- Automated metadata enrichment (no manual entry needed)
- Condition-specific price estimates
- Performance analytics (biggest gainers/losers)
- Beautiful, mobile-first design inherited from comics.banast.as
- Proven technical architecture with React 18, TypeScript, and Vite

**Next Steps:**
1. Review and approve PRD
2. Set up project repository
3. Generate Discogs Personal Access Token
4. Begin Phase 1: Foundation development
5. Iterate based on testing and feedback
