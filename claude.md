# vinyl.banast.as

A sleek vinyl record collection manager with Discogs API integration, real-time marketplace pricing, and investment tracking.

**Live Site:** https://vinyl.banast.as

## Project Overview

vinyl.banast.as is a modern vinyl record collection manager that combines Discogs API integration with a retro-futuristic Tron-inspired UI. The application tracks your physical vinyl collection, monitors marketplace values, and calculates investment performance by comparing purchase prices with current market values.

### Key Features

- **Discogs Integration**: One-click import from Discogs "Vinyl" folder with automatic metadata
- **Real-Time Pricing**: Live marketplace values via Discogs `marketplace/stats` endpoint
- **Investment Tracking**: Purchase price preservation with automatic gain/loss calculations
- **Tron UI Theme**: Dark aesthetic with neon cyan, orange, and pink accents inspired by Tron (1982)
- **Smart Filtering**: Full-text search, clickable artists, and intelligent inter-linking
- **Stats Dashboard**: Collection overview, top performers, and condition breakdown
- **Data Preservation**: Manual edits (purchase prices, notes, tags) preserved across imports
- **BBCode Parsing**: Discogs URL formatting automatically converted to clickable links
- **Artist Name Cleaning**: Removes Discogs disambiguators like "(2)" from display

### Design Philosophy

1. **Preservation-First**: Manual data (purchase prices, notes, tags) never overwritten by imports
2. **Tron Aesthetic**: Retro-futuristic 1980s design with clean cover art (no overlays)
3. **Investment Focus**: Track gains/losses vs. purchase prices for collection performance
4. **Discogs Metadata**: Official artist names, labels, genres, and cover art from Discogs
5. **Local-First**: Collection stored in `vinyls.json` with localStorage persistence

## Tech Stack

### Frontend Framework
- **React 18** - UI library with functional components and hooks
- **TypeScript 5** - Type safety for data models and API integration
- **Vite 7** - Fast build tool with HMR and code splitting

### State Management
- **Zustand 5** - Lightweight state management with persistence
- **localStorage** - Client-side collection persistence
- **Computed Properties** - Real-time stats calculations

### Styling
- **Tailwind CSS 3** - Utility-first CSS with custom Tron theme
- **Lucide React** - Icon library for UI elements
- **Custom Colors**:
  - `tron-bg`: #0a0e27 (deep dark blue)
  - `tron-cyan`: #00d9ff (primary accent)
  - `tron-orange`: #ff6c00 (hover states)
  - `tron-pink`: #ff00ff (secondary accent)

### API Integration
- **Discogs API v2.0** - Collection data and metadata
- **Axios 1.6** - HTTP client with rate limiting
- **marketplace/stats** - Real-time pricing (no seller settings required)
- **Personal Access Token** - Authentication

### Utilities
- **BBCode Parser** - Convert Discogs `[url=...]text[/url]` to HTML links
- **Artist Name Cleaner** - Remove Discogs disambiguators like "(2)"
- **Zod 4** - Schema validation for vinyl data
- **currency.js 2** - Currency formatting and calculations

### Deployment
- **Cloudflare Pages** - Static site hosting
- **Node.js Import Script** - Runs locally to fetch Discogs data

## Project Structure

```
vinyl.banast.as/
├── src/
│   ├── components/
│   │   ├── VinylCard.tsx           # Grid card with clean cover art
│   │   ├── VinylDashboard.tsx      # Stats dashboard with top performers
│   │   ├── FluidTypography.tsx     # Responsive text component
│   │   ├── ResponsiveImage.tsx     # Optimized image loading
│   │   ├── TouchTarget.tsx         # Accessible touch targets
│   │   ├── LoadingSkeleton.tsx     # Loading state placeholders
│   │   └── ErrorBoundary.tsx       # Error handling wrapper
│   ├── stores/
│   │   └── vinylStore.ts           # Zustand store (628 lines)
│   ├── services/
│   │   ├── discogsClient.ts        # Discogs API client
│   │   └── discogsImport.ts        # Import service
│   ├── types/
│   │   ├── Vinyl.ts                # TypeScript interfaces (144 lines)
│   │   └── Discogs.ts              # Discogs API types
│   ├── utils/
│   │   ├── bbcodeParser.ts         # Parse Discogs BBCode URLs
│   │   ├── artistNameCleaner.ts    # Remove disambiguators
│   │   └── vinylStorage.ts         # localStorage helpers
│   ├── validation/
│   │   └── vinylSchema.ts          # Zod schemas for validation
│   ├── data/
│   │   └── vinyls.json             # Collection data (4826 lines, 97 records)
│   ├── App.tsx                     # Main app component (474 lines)
│   └── main.tsx                    # React entry point
├── import-collection.mjs           # Discogs import script (331 lines)
├── import-new-vinyls.mjs          # Import new additions only
├── update-prices.mjs              # Update marketplace prices
├── create-sample-collection.mjs   # Generate sample data
├── PURCHASE_PRICE_GUIDE.md        # Manual price tracking guide
├── .env.example                   # Environment variables template
├── vite.config.ts                 # Vite configuration with code splitting
├── tailwind.config.js             # Tron theme colors
└── package.json
```

## Key Files

### Components

**src/components/VinylCard.tsx**
- Grid card component displaying cover art and metadata
- Clickable artist names for filtering
- Hover effects with Tron glow
- Responsive layout (2-6 columns based on viewport)

**src/components/VinylDashboard.tsx**
- Stats overview: total records, collection value, gain/loss
- Top performers: highest value, biggest gainer, biggest loser
- Condition breakdown with visual bar chart
- Unique counts: artists (68), labels (69), genres (10)
- Clickable navigation to vinyl details

### State Management

**src/stores/vinylStore.ts** (628 lines)
- Zustand store with localStorage persistence
- Loads from `vinyls.json` on initial mount
- Filtering system (artist, label, genre, year, price, condition)
- Sorting: date added, artist, title, year, value, gain/loss
- Computed stats: collection value, top performers, condition breakdown
- Navigation actions: vinyl detail, artist filter, genre filter
- Automatic gain/loss calculation when purchase price exists

Key functions:
```typescript
// Calculate gain/loss for vinyls with purchase prices
const calculateGainLoss = (vinyls: Vinyl[]): Vinyl[] => {
  return vinyls.map(vinyl => {
    if (vinyl.purchasePrice !== undefined) {
      const currentValue = vinyl.estimatedValue ?? vinyl.purchasePrice;
      const gainLoss = currentValue - vinyl.purchasePrice;
      const gainLossPercentage = vinyl.purchasePrice > 0
        ? (gainLoss / vinyl.purchasePrice) * 100
        : 0;
      return { ...vinyl, gainLoss, gainLossPercentage };
    }
    return vinyl;
  });
};
```

### Type Definitions

**src/types/Vinyl.ts** (144 lines)
- `Vinyl` interface: complete vinyl record model
- `VinylStats` interface: collection statistics
- `VinylCondition` type: Mint, Near Mint, VG+, VG, G+, G, Fair, Poor
- `SortField` type: sort options for collection
- `FilterOptions` interface: filtering criteria

Core types:
```typescript
export interface Vinyl {
  // Identifiers
  id: string;
  discogsReleaseId?: number;
  discogsMasterId?: number;

  // Basic info
  artist: string;
  artists: Artist[];
  title: string;
  label: string;
  catalogNumber: string;
  releaseYear: number;
  country: string;
  format: string[];
  genres: string[];
  styles: string[];

  // Physical details
  coverImageUrl: string;
  sleeveCondition: VinylCondition;
  mediaCondition: VinylCondition;

  // Manual data (preserved on import)
  purchasePrice?: number;
  purchaseDate: string;
  storageLocation: string;
  tags: string[];
  notes: string;

  // Market data (from Discogs)
  estimatedValue?: number;
  suggestedPrice?: number;
  lastPriceUpdate?: string;

  // Calculated
  gainLoss?: number;
  gainLossPercentage?: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastSyncedWithDiscogs?: string;
}
```

### Utilities

**src/utils/bbcodeParser.ts** (33 lines)
- Parse Discogs BBCode to HTML
- Converts `[url=...]text[/url]` to clickable links
- Supports `[b]`, `[i]`, `[u]` formatting
- Applies Tron theme classes to links

**src/utils/artistNameCleaner.ts** (15 lines)
- Remove Discogs disambiguators like " (2)"
- Example: "Haim (2)" → "Haim"
- Used for display and filtering

### Import Scripts

**import-collection.mjs** (331 lines)
- Import entire Discogs collection from "Vinyl" folder (ID: 7559246)
- Preserves manual edits from existing `vinyls.json`
- Fetches full release details and marketplace stats
- Rate-limited to 50 requests/minute (conservative for Discogs API)
- Saves progress every 10 records
- Auto-retries on 429 (rate limit) errors

Preserved fields on re-import:
- ✅ `purchasePrice` - Manual purchase price
- ✅ `purchaseDate` - When added to collection
- ✅ `storageLocation` - Custom storage info
- ✅ `tags` - Custom tags
- ✅ `notes` - Your notes (Discogs notes won't overwrite)
- ✅ `sleeveCondition` - Your condition rating
- ✅ `mediaCondition` - Your condition rating

**update-prices.mjs**
- Update marketplace prices for existing collection
- Faster than full import (skips full release details)
- Preserves all manual data

**import-new-vinyls.mjs**
- Import only new additions since last import
- Compares existing collection with Discogs folder

### Configuration

**vite.config.ts**
- Manual code splitting for optimal bundle sizes
  - `react-vendor`: React + React DOM
  - `icons`: Lucide icons
  - `data`: vinyls.json
  - `utils`: BBCode parser, artist name cleaner
  - `components`: Core UI components
- Chunk size warning limit: 600KB

**tailwind.config.js**
- Custom Tron color palette
- Tron glow shadow effects
- Responsive design utilities

## Development Workflow

### Initial Setup

```bash
# Clone repository
cd vinyl.banast.as

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_DISCOGS_TOKEN=your_personal_access_token_here
VITE_DISCOGS_USERNAME=your_discogs_username
VINYL_FOLDER_ID=7559246
EOF

# Get Discogs API token:
# 1. Go to https://www.discogs.com/settings/developers
# 2. Scroll to "Personal Access Tokens"
# 3. Click "Generate new token"
# 4. Name it "Vinyl Collection Manager"
# 5. Copy token to .env

# Import collection
node import-collection.mjs

# Start dev server
npm run dev
```

### Import Collection

```bash
# Full import (preserves manual data)
node import-collection.mjs

# Update prices only
node update-prices.mjs

# Import new additions only
node import-new-vinyls.mjs

# Create sample collection
node create-sample-collection.mjs
```

### Adding Purchase Prices

Edit `src/data/vinyls.json` manually:

```json
{
  "id": "...",
  "discogsReleaseId": 18385729,
  "artist": "RZA",
  "title": "Ghost Dog: The Way Of The Samurai",
  "purchasePrice": 15.99,
  "estimatedValue": 19,
  ...
}
```

Then run `node import-collection.mjs` to recalculate gain/loss.

### Available Scripts

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Build for production (outputs to dist/)
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Discogs API Integration

### Authentication
- **Method**: Personal Access Token
- **Header**: `Authorization: Discogs token=${DISCOGS_TOKEN}`
- **User-Agent**: `VinylBanastAs/1.0 +https://vinyl.banast.as`

### Endpoints Used

**Collection Folder**
```
GET /users/{username}/collection/folders/{folder_id}/releases
```
- Fetch all releases from "Vinyl" folder
- Pagination: 100 items per page
- Returns basic release info

**Release Details**
```
GET /releases/{release_id}
```
- Full metadata: artist, title, label, year, country, genres
- Cover art URLs
- Format details

**Marketplace Stats**
```
GET /marketplace/stats/{release_id}
```
- `lowest_price.value` - Current lowest asking price
- `num_for_sale` - Number of listings
- Used as `estimatedValue`

### Rate Limiting

- **Limit**: 60 requests/minute (authenticated)
- **Implementation**: 50 requests/minute (conservative)
- **Delay**: 1.2 seconds between requests
- **Retry**: Auto-retry on 429 errors with 65-second backoff

## Features Deep Dive

### Investment Tracking

The application calculates investment performance for records with purchase prices:

```typescript
// Gain/Loss calculation
const currentValue = vinyl.estimatedValue ?? vinyl.purchasePrice;
const gainLoss = currentValue - vinyl.purchasePrice;
const gainLossPercentage = (gainLoss / vinyl.purchasePrice) * 100;
```

Stats dashboard shows:
- **Total Gain/Loss**: Sum of all gains/losses
- **Biggest Gainer**: Record with highest gain (clickable to view)
- **Biggest Loser**: Record with largest loss (clickable to view)
- **Total Current Value**: Sum of all estimated values
- **Total Invested**: Sum of all purchase prices

### Sorting Behavior

When sorted by artist or title, records are displayed:
1. Alphabetically by primary field (artist/title)
2. Chronologically by release year (earliest first) for same artist

This creates a natural "discography view" for multi-record artists.

```typescript
// Secondary sort by release year
if (sortField === 'artist' || sortField === 'title') {
  const aYear = a.releaseYear || 0;
  const bYear = b.releaseYear || 0;
  if (aYear !== bYear) {
    return aYear - bYear; // Always ascending (earliest first)
  }
}
```

### Clickable Navigation

- **Artist names**: Click to filter collection by artist
- **Title/Logo**: Click to return to homepage and clear filters
- **Stats cards**: Click artist/title in "Top Performers" to navigate to detail
- **Search**: Full-text search across artist, album, label, catalog number, notes

### BBCode Parsing

Discogs notes often contain BBCode links. These are automatically converted to clickable HTML:

Input:
```
[url=http://www.discogs.com/artist/Steve+Winwood]Steve Winwood[/url]
```

Output:
```html
<a href="http://www.discogs.com/artist/Steve+Winwood"
   target="_blank"
   rel="noopener noreferrer"
   class="text-tron-cyan hover:text-tron-orange underline transition-colors">
  Steve Winwood
</a>
```

## Data Model

### Collection Storage

- **Source**: `src/data/vinyls.json` (4826 lines)
- **Format**: JSON array of Vinyl objects
- **Size**: ~97 records in current collection
- **Persistence**: localStorage + JSON file

### Data Flow

1. **Initial Load**: Load from `vinyls.json` on app mount
2. **State**: Zustand store calculates gain/loss for all records
3. **Filtering**: Apply search/sort to create `filteredVinyls`
4. **Display**: Render filtered collection in grid
5. **Import**: Node.js script fetches from Discogs → saves to `vinyls.json`
6. **Preservation**: Manual edits preserved by matching `discogsReleaseId`

### Statistics Calculation

All stats are computed in real-time from the Zustand store:

```typescript
get stats() {
  const vinylsWithPurchasePrice = state.vinyls.filter(v => v.purchasePrice);

  const totalPurchaseValue = vinylsWithPurchasePrice
    .reduce((sum, v) => sum + (v.purchasePrice || 0), 0);

  const totalCurrentValue = vinylsWithPurchasePrice
    .reduce((sum, v) => sum + (v.estimatedValue ?? v.purchasePrice!), 0);

  const totalGainLoss = vinylsWithPurchasePrice
    .reduce((sum, v) => sum + (v.gainLoss || 0), 0);

  // ... condition breakdown, top performers, etc.
}
```

## Common Tasks

### Import Full Collection

```bash
# Set environment variables
export DISCOGS_TOKEN="your_token_here"
export DISCOGS_USERNAME="your_username"

# Run import (takes 5-10 minutes for 100 records)
node import-collection.mjs

# Output:
# 📊 Import Summary:
#   Total records: 97
#   With prices: 92
#   With cover art: 97
#   Genres: 10
#   Labels: 69
#   Artists: 68
# 💰 Total estimated value: $2,145.00
```

### Update Marketplace Prices

```bash
# Only update prices (faster than full import)
node update-prices.mjs
```

### Add Purchase Prices

1. Open `src/data/vinyls.json`
2. Find record by artist or Discogs ID
3. Add `purchasePrice` field:
   ```json
   {
     "discogsReleaseId": 18385729,
     "artist": "RZA",
     "title": "Ghost Dog: The Way Of The Samurai",
     "purchasePrice": 15.99,
     ...
   }
   ```
4. Save file
5. Run `node import-collection.mjs` to recalculate gain/loss
6. Refresh app to see updated stats

### Filter Collection by Artist

Click any artist name in the collection view or stats dashboard. The app will:
1. Switch to collection tab
2. Clear selected vinyl
3. Set search term to artist name (cleaned of disambiguators)
4. Filter collection to show only that artist's records

### View Collection Stats

1. Click "Stats" button in header
2. View:
   - Total records, collection value, total gain/loss
   - Highest valued record (clickable)
   - Biggest gainer/loser (clickable)
   - Condition breakdown (visual chart)
   - Unique counts: artists, labels, genres

## SEO & Performance

### Build Optimization

Vite config includes manual code splitting for optimal bundle sizes:
- **react-vendor**: 142KB (React + ReactDOM)
- **icons**: 89KB (Lucide icons)
- **data**: 150KB+ (vinyls.json)
- **components**: 45KB (UI components)
- **utils**: 3KB (BBCode parser, name cleaner)

### Image Loading

- Cover art loaded from Discogs CDN
- Responsive images with aspect ratio preservation
- Loading skeletons for image placeholders

### localStorage Persistence

- Entire collection cached in localStorage
- Instant load on subsequent visits
- Auto-save on add/update/delete

## Deployment

### Build for Production

```bash
npm run build
# Output: dist/
```

### Deploy to Cloudflare Pages

1. Connect GitHub repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Environment variables (optional, not needed for static build):
   - `VITE_DISCOGS_TOKEN` - Used only during import script
   - `VITE_DISCOGS_USERNAME` - Used only during import script

Note: Import scripts run locally via Node.js. The built site loads static data from `vinyls.json`.

### Updating Production Collection

1. Run import locally: `node import-collection.mjs`
2. Commit updated `src/data/vinyls.json`
3. Push to GitHub
4. Cloudflare Pages auto-deploys

## Troubleshooting

### Import Issues

**Problem**: Import fails with 401 Unauthorized
**Solution**: Check `.env` file has correct `DISCOGS_TOKEN` and `DISCOGS_USERNAME`

**Problem**: Import fails with 429 Too Many Requests
**Solution**: Script auto-retries. If persistent, increase `DELAY_MS` in `import-collection.mjs`

**Problem**: Some records show no estimated value
**Solution**: Not all releases have marketplace data in Discogs. This is normal. Current collection: 92/97 have prices.

### Stats Not Updating

**Problem**: Gain/loss not appearing after adding purchase price
**Solution**: Run `node import-collection.mjs` after editing `vinyls.json` to recalculate

**Problem**: Stats dashboard shows outdated totals
**Solution**: Hard refresh browser (Cmd+Shift+R) to clear localStorage cache

### UI Issues

**Problem**: Cover art not loading
**Solution**: Check Discogs CDN availability. Some older releases may have placeholder images.

**Problem**: Search not finding records
**Solution**: Search is case-insensitive and searches artist, title, label, catalog number, and notes fields.

## Roadmap

### Completed ✅
- [x] Discogs API integration
- [x] Marketplace pricing
- [x] Purchase price tracking with preservation
- [x] Gain/loss analytics
- [x] Tron UI theme
- [x] BBCode link parsing
- [x] Artist name cleaning
- [x] Clickable inter-linking
- [x] Stats dashboard
- [x] Clean cover art (no overlays)
- [x] Responsive design
- [x] Full-text search
- [x] Advanced sorting

### Planned 🔜
- [ ] UI for editing purchase prices (currently manual JSON editing)
- [ ] Date-based price history tracking
- [ ] Export collection to CSV
- [ ] Print-friendly collection list
- [ ] Discogs want list integration

### Future 💭
- [ ] PostgreSQL backend for multi-user support
- [ ] Automatic price update scheduling
- [ ] Price alert notifications
- [ ] Mobile app with barcode scanning
- [ ] Insurance valuation reports

## Credits

- **Built by**: banastas (https://github.com/banastas)
- **Powered by**: Discogs API (https://www.discogs.com/developers/)
- **Icons**: Lucide (https://lucide.dev/)
- **Inspiration**: comics.banast.as architecture

## Related Projects

- **comics.banast.as** - Comic book collection manager with similar architecture
- **photo.banast.as** - Photo blog with EXIF-first design

---

**Live at vinyl.banast.as** - Track your vinyl collection with style! 🎵
