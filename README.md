# vinyl.banast.as 🎵

A modern vinyl record collection manager with real-time market pricing from the Discogs API.

Perfect for vinyl collectors who want to:
- 🎵 Track their entire collection digitally with official Discogs data
- 💰 Monitor collection value with real-time marketplace pricing
- 📈 Analyze collection trends and financial performance
- 🔍 Search and filter records easily
- 📱 Access their collection on any device
- 🔄 Import collection directly from Discogs

## 🚀 Quick Start

Get your vinyl collection manager running in under 5 minutes:

### Prerequisites
- Node.js 18 or higher ([Download here](https://nodejs.org/))
- A Discogs account
- Personal Access Token from Discogs

### Installation

```bash
# 1. Navigate to the project
cd vinyl.banast.as

# 2. Install dependencies
npm install

# 3. Get your Discogs API credentials
# Go to https://www.discogs.com/settings/developers
# Generate a Personal Access Token

# 4. Create .env file with your credentials
cp .env.example .env
# Edit .env and add your token and username

# 5. Test your API connection
# Open test-discogs.html in your browser

# 6. Start the development server
npm run dev

# 7. Open http://localhost:5173 and click "Import from Discogs"!
```

## ✨ Features

### Discogs Integration
- **One-Click Import**: Import your entire Discogs collection with a single click
- **Automatic Metadata**: Artist, title, label, format, genres automatically populated
- **Cover Art**: High-resolution album covers from Discogs CDN
- **Real-Time Pricing**: Current marketplace values updated from Discogs
- **Smart Caching**: 7-day metadata cache, 24-hour price cache to minimize API calls
- **Rate Limit Management**: Automatic request throttling (240 req/min authenticated)

### Collection Management
- **Comprehensive Record Details**: Artist, album, label, catalog number, year, country, format
- **Condition Grading**: Goldmine standard for media and sleeve (M, NM, VG+, VG, etc.)
- **Physical Tracking**: Pressing info, colored vinyl variants, weight (180g, etc.)
- **Financial Tracking**: Purchase price/date, current estimated value, gain/loss calculations
- **Organization**: Custom tags, storage locations, personal notes

### Advanced Analytics
- **Dashboard Overview**: Total records, collection value, top performers
- **Performance Analytics**: Biggest gainers/losers in your collection
- **Condition Breakdown**: Records by condition with clickable stats
- **Format Statistics**: LP, EP, 7" single breakdowns
- **Artist/Label Analytics**: Most collected artists and labels
- **Genre Distribution**: Collection breakdown by genre and style

### Search & Filter
- **Full-Text Search**: Search artist, album, label, catalog number, notes
- **Advanced Filters**: Artist, label, genre, format, condition, year range, price range
- **Special Filters**: Colored vinyl only, first pressings only
- **Flexible Sorting**: By artist, title, year, value, gain/loss, condition
- **Storage Location**: Filter by physical storage location

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite with optimized code splitting
- **Styling**: Tailwind CSS with vinyl-themed design
- **State Management**: Zustand
- **API**: Discogs API v2.0 with OAuth support
- **HTTP Client**: Axios with rate limiting & caching
- **Validation**: Zod schemas
- **Icons**: Lucide React

## 📋 Getting Started

### 1. Get Discogs API Credentials

1. Go to https://www.discogs.com/settings/developers
2. Scroll to "Personal Access Tokens"
3. Click "Generate new token"
4. Give it a name (e.g., "Vinyl Collection Manager")
5. Copy the token (you'll only see it once!)

Your credentials from the setup:
- **Consumer Key**: `IlkMMMhQkNhBbfBVaqVq`
- **Consumer Secret**: `kdFDswYzuWEYlMlyIHrxejZdBeTOJkTo`
- **Username**: `banastas`

### 2. Configure Environment

Create `.env` file in project root:

```env
VITE_DISCOGS_TOKEN=IlkMMMhQkNhBbfBVaqVq
VITE_DISCOGS_CONSUMER_SECRET=kdFDswYzuWEYlMlyIHrxejZdBeTOJkTo
VITE_DISCOGS_USERNAME=banastas
```

### 3. Test API Connection

Open `test-discogs.html` in your browser to verify:
- ✅ API credentials are valid
- ✅ Connection to Discogs works
- ✅ You can fetch your collection
- ✅ Rate limits are healthy

### 4. Import Your Collection

1. Start the dev server: `npm run dev`
2. Click "Import from Discogs" button
3. Wait while your collection is imported (shows progress)
4. Done! Your collection is now loaded with pricing data

## 📊 Data Model

Each vinyl record includes:

### From Discogs (Automatic)
- Artist(s) with roles
- Album title
- Record label(s) and catalog numbers
- Release year and country
- Format (LP, EP, 7", etc.)
- Genres and styles
- Cover art (high-res)
- Current marketplace prices
- Price suggestions by condition

### Your Collection Data
- Media condition (M, NM, VG+, etc.)
- Sleeve condition
- Purchase price and date
- Storage location
- Custom tags
- Personal notes

### Calculated Fields
- Estimated current value
- Gain/loss in $
- Gain/loss in %
- Last price update timestamp

## 🎯 Usage

### Importing from Discogs

The import process:
1. Fetches all releases from your Discogs collection folder
2. For each release, gets full metadata and cover art
3. Retrieves current marketplace pricing
4. Maps Discogs data to local vinyl format
5. Calculates estimated value and gain/loss

Import is **one-way and read-only** - your Discogs collection is never modified.

### Price Updates

- **Manual**: Refresh prices for individual records or entire collection
- **Automatic**: Schedule daily/weekly price updates (configurable)
- **Bulk**: Update all records with Discogs IDs efficiently

### Search & Organization

Filter your collection by:
- Artist, label, genre, style, format
- Release year range
- Purchase price range
- Media/sleeve condition
- Country of release
- Custom tags
- Storage location
- Colored vinyl / first pressings

## 🗂️ Project Structure

```
vinyl.banast.as/
├── src/
│   ├── components/          # React components
│   │   ├── VinylCard.tsx           # Record grid card
│   │   ├── Dashboard.tsx           # Stats dashboard
│   │   └── ...
│   ├── services/            # API & business logic
│   │   ├── discogsClient.ts        # Discogs API client
│   │   └── discogsImport.ts        # Import utilities
│   ├── stores/              # State management
│   │   └── vinylStore.ts           # Zustand store
│   ├── types/               # TypeScript types
│   │   ├── Vinyl.ts                # Vinyl data model
│   │   └── Discogs.ts              # Discogs API types
│   ├── validation/          # Zod schemas
│   │   └── vinylSchema.ts
│   └── data/
│       └── vinyls.json             # Your collection
├── .env                     # API credentials
├── .env.example             # Example config
├── test-discogs.html        # API test page
└── README.md
```

## ⚙️ Configuration

### Environment Variables

**Required:**
- `VITE_DISCOGS_TOKEN` - Your Personal Access Token
- `VITE_DISCOGS_USERNAME` - Your Discogs username

**Optional:**
- `VITE_DISCOGS_CONSUMER_SECRET` - For OAuth (future)
- `VITE_PRICE_CACHE_TTL` - Price cache duration (default: 24 hours)
- `VITE_METADATA_CACHE_TTL` - Metadata cache (default: 7 days)

### API Rate Limits

- **Authenticated**: 240 requests/minute (4 req/sec)
- **Unauthenticated**: 60 requests/minute (1 req/sec)

The app automatically:
- Queues requests to stay within limits
- Implements exponential backoff on errors
- Caches responses to minimize API calls
- Shows progress during bulk imports

### Caching Strategy

- **Release Metadata**: 7 days (rarely changes)
- **Price Data**: 24 hours (updates daily)
- **Cover Images**: Permanent (via Discogs CDN URLs)

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The `dist/` folder contains your production app.

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables:
   - `VITE_DISCOGS_TOKEN`
   - `VITE_DISCOGS_USERNAME`
   - `VITE_DISCOGS_CONSUMER_SECRET` (optional)

### Deploy to Vercel

```bash
vercel deploy
```

Add environment variables in Vercel dashboard.

## 🔧 Development

### Available Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Testing API Connection

```bash
# Open test-discogs.html in browser
open test-discogs.html
```

This standalone HTML page tests:
- API authentication
- User profile access
- Collection fetching
- Rate limit status

## 🐛 Troubleshooting

### "Failed to import collection"

1. Check `.env` file has correct credentials
2. Open `test-discogs.html` to verify API connection
3. Check browser console for detailed errors
4. Verify you haven't exceeded rate limits (240 req/min)

### "Rate limit exceeded"

The authenticated limit is 240 requests/minute. For large collections (500+ records), import may take several minutes. This is normal - be patient!

### Missing prices

Not all releases have price suggestions in Discogs. This is normal. You can manually enter estimated values if needed.

### Build errors

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 🗺️ Roadmap

### Phase 2 (Post-MVP)
- [ ] OAuth multi-user support
- [ ] PWA features (offline mode, installable)
- [ ] Advanced analytics charts (Recharts)
- [ ] Price alert notifications
- [ ] Wish list with price tracking
- [ ] Export to Discogs

### Phase 3 (Future)
- [ ] PostgreSQL/Supabase backend
- [ ] User accounts and cloud sync
- [ ] Social features (share collections)
- [ ] Marketplace integration
- [ ] Mobile app with barcode scanner
- [ ] Insurance valuation reports

## 📄 License

MIT License - feel free to use this for your own collection!

## 🙏 Credits

- Built by [banastas](https://github.com/banastas)
- Based on [comics.banast.as](https://comics.banast.as) architecture
- Powered by [Discogs API](https://www.discogs.com/developers/)
- Icons by [Lucide](https://lucide.dev/)

## 📞 Support

- **Issues**: https://github.com/banastas/vinyl.banast.as/issues
- **Discogs API Docs**: https://www.discogs.com/developers/

---

**Enjoy tracking your vinyl collection!** 🎵✨
