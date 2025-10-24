[![Live Site](https://img.shields.io/badge/Live-vinyl.banast.as-00d9ff?style=for-the-badge)](https://vinyl.banast.as)
[![Powered by Discogs](https://img.shields.io/badge/Powered%20by-Discogs%20API-ff6c00?style=for-the-badge)](https://www.discogs.com/developers/)

[![Built with React](https://img.shields.io/badge/Built%20with-React%2018-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

<img src="https://github.com/banastas/vinyl.banast.as/blob/main/vinyl.banast.as.png?raw=true">

# vinyl.banast.as 🎵

A sleek vinyl record collection manager with Discogs API integration, real-time marketplace pricing, and manual purchase price tracking.

**Live at:** [vinyl.banast.as](https://vinyl.banast.as)

Perfect for vinyl collectors who want to:
- 🎵 Track their entire collection with official Discogs metadata
- 💰 Monitor collection value with real-time marketplace pricing
- 📈 Track investment performance with purchase price preservation
- 🔍 Search and filter records with intelligent inter-linking
- 🎨 Browse with a beautiful Tron 1980s-inspired UI
- 📱 Access their collection on any device

## ✨ Features

### 🎨 Tron-Themed UI
- **Dark aesthetic** with neon cyan, orange, and pink accents
- **Retro-futuristic design** inspired by Tron (1982)
- **Clean cover art** with metadata below (no overlays)
- **Smooth transitions** and hover effects
- **Fully responsive** mobile, tablet, and desktop

### 💿 Discogs Integration
- **One-Click Import**: Import entire collection from Discogs "Vinyl" folder (excludes CDs)
- **Automatic Metadata**: Artist, title, label, format, genres, year, country
- **Cover Art**: High-resolution album artwork from Discogs CDN
- **Real-Time Pricing**: Marketplace values via `marketplace/stats` endpoint (no seller settings required)
- **BBCode Parsing**: Discogs URL formatting automatically converted to clickable links
- **Artist Name Cleaning**: Removes Discogs disambiguators like "(2)" from display

### 💰 Purchase Price Tracking
- **Manual Price Entry**: Edit `vinyls.json` to add purchase prices
- **Preservation Across Imports**: Purchase prices never overwritten by Discogs imports
- **Automatic Gain/Loss**: Calculates profit/loss vs. marketplace value
- **Percentage Returns**: Shows gain/loss as both dollar amount and percentage
- **Persistent Data**: Only clears if vinyl removed from Discogs collection entirely

See [PURCHASE_PRICE_GUIDE.md](PURCHASE_PRICE_GUIDE.md) for detailed instructions.

### 🔍 Advanced Search & Filtering
- **Full-Text Search**: Search artist, album, label, catalog number, notes
- **Smart Sorting**:
  - Date Added (newest first)
  - Artist (alphabetical, then chronological by release year)
  - Title (A-Z)
  - Year (oldest/newest)
  - Estimated Value (high/low)
  - Gain/Loss (biggest gains/losses)
  - Purchase Price (if tracked)
- **Clickable Artists**: Click any artist name to filter collection
- **Clickable Navigation**: Logo/title returns to homepage

### 📊 Stats Dashboard
- **Collection Overview**:
  - Total Records
  - Collection Value (marketplace total)
  - Total Gain/Loss (vs. purchase prices)
  - Average Value per record
- **Top Performers**:
  - Highest Value record
  - Biggest Gainer (clickable artist & title)
  - Biggest Loser (clickable artist & title)
- **Condition Breakdown**: Visual bar chart by media condition
- **Additional Stats**:
  - Unique Artists (68)
  - Unique Labels (69)
  - Unique Genres (10)
  - Records with Pricing (92/97)
- **Clickable Stats**: Artist/title links navigate to detail or filter views

### 📀 Record Details
Each vinyl record includes:
- **Discogs Data** (auto-imported):
  - Artist(s), Title, Label, Catalog Number
  - Release Year, Country, Format(s)
  - Genres and Styles
  - Media & Sleeve Condition
  - Cover artwork
  - Marketplace estimated value
  - Discogs link
- **Manual Data** (preserved):
  - Purchase Price
  - Purchase Date
  - Storage Location
  - Tags
  - Notes (supports BBCode links)
- **Calculated**:
  - Gain/Loss ($)
  - Gain/Loss (%)
  - Last price update timestamp

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Discogs account with Personal Access Token
- Your collection in a Discogs folder named "Vinyl"

### Installation

```bash
# 1. Clone and navigate
cd vinyl.banast.as

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << EOF
VITE_DISCOGS_TOKEN=your_personal_access_token_here
VITE_DISCOGS_USERNAME=your_discogs_username
EOF

# 4. Import your collection
node import-collection.mjs

# 5. Start dev server
npm run dev

# 6. Open http://localhost:5173
```

### Get Discogs API Token

1. Go to https://www.discogs.com/settings/developers
2. Scroll to "Personal Access Tokens"
3. Click "Generate new token"
4. Name it "Vinyl Collection Manager"
5. Copy the token to `.env`

## 📋 Import & Sync

### Initial Import

```bash
node import-collection.mjs
```

This will:
1. Fetch all releases from your "Vinyl" folder (ID: 7559246)
2. Get full metadata for each release
3. Retrieve marketplace pricing
4. Save to `src/data/vinyls.json`
5. Calculate gain/loss for records with purchase prices

### Re-importing (Preserves Manual Data)

Running the import script again will:
- ✅ Update marketplace prices
- ✅ Refresh Discogs metadata (cover art, genres, etc.)
- ✅ **Preserve** purchase prices, notes, tags, storage locations
- ✅ Only remove records deleted from Discogs

### Adding Purchase Prices

Edit `src/data/vinyls.json` and add `purchasePrice` field:

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

Next import will calculate `gainLoss` and `gainLossPercentage` automatically.

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS (custom Tron theme)
- **State Management**: Zustand with localStorage persistence
- **API**: Discogs API v2.0
  - Endpoint: `marketplace/stats` for pricing
  - Authentication: Personal Access Token
  - Folder: "Vinyl" (excludes CDs)
- **Utilities**:
  - BBCode parser for Discogs links
  - Artist name cleaner (removes disambiguators)
- **Icons**: Lucide React
- **Deployment**: Cloudflare Pages

## 🎨 Color Theme

**Tron 1980s Aesthetic:**
```css
tron-bg: #0a0e27          /* Deep dark blue */
tron-bg-light: #0f1729    /* Card backgrounds */
tron-cyan: #00d9ff        /* Primary accent, links */
tron-orange: #ff6c00      /* Hover states, highlights */
tron-pink: #ff00ff        /* Secondary accent */
tron-text-primary: #e0f7ff /* Main text */
tron-text-secondary: #8bb8d9 /* Subdued text */
```

## 📁 Project Structure

```
vinyl.banast.as/
├── src/
│   ├── components/
│   │   ├── VinylCard.tsx          # Grid card with clean cover art
│   │   ├── VinylDashboard.tsx     # Stats dashboard
│   │   └── ...
│   ├── stores/
│   │   └── vinylStore.ts          # Zustand state management
│   ├── types/
│   │   └── Vinyl.ts               # TypeScript interfaces
│   ├── utils/
│   │   ├── bbcodeParser.ts        # Parse Discogs BBCode URLs
│   │   ├── artistNameCleaner.ts   # Remove disambiguators
│   │   └── vinylStorage.ts        # localStorage helpers
│   ├── services/
│   │   └── discogsClient.ts       # Discogs API integration
│   └── data/
│       └── vinyls.json            # Your collection (97 records)
├── import-collection.mjs          # Import script (preserves manual data)
├── PURCHASE_PRICE_GUIDE.md        # How to track purchase prices
├── BLURAY_PRD.md                  # PRD for future bluray.banast.as
├── tailwind.config.js             # Tron color theme
└── README.md
```

## 🔧 Development

### Available Scripts

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Build for production
npm run preview   # Preview production build
```

### Import Collection

```bash
node import-collection.mjs
```

Options:
- Imports from Discogs folder ID 7559246 ("Vinyl")
- Preserves purchase prices and manual fields
- Rate-limited to comply with Discogs API
- Shows progress during import

## 🚀 Deployment

### Build

```bash
npm run build
```

Output: `dist/` folder

### Deploy to Cloudflare Pages

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables:
   - `VITE_DISCOGS_TOKEN` (not needed for static build)
   - `VITE_DISCOGS_USERNAME` (not needed for static build)

**Note:** Import runs locally via Node.js, not in browser. The built site loads from `vinyls.json`.

## 💡 Usage Tips

### Sorting by Artist
When sorted by artist, records are displayed:
1. Alphabetically by artist name
2. Chronologically by release year (earliest to newest) for same artist

This creates a natural "discography view" for multi-record artists.

### Tracking Investments
1. Add `purchasePrice` to records in `vinyls.json`
2. Run `node import-collection.mjs` to calculate gains/losses
3. View stats dashboard for:
   - Total Gain/Loss
   - Biggest Gainer
   - Biggest Loser
   - Average return

### Clickable Navigation
- **Artist names**: Click to filter collection by artist
- **Title/Logo**: Click to return to homepage
- **Stats cards**: Click artist/title in "Top Performers" to navigate

### Filtering
Use the search bar to find:
- Artist names (e.g., "RZA")
- Album titles (e.g., "Ghost Dog")
- Labels, genres, or any text in metadata

## 📊 Data Model

### Vinyl Interface

```typescript
interface Vinyl {
  // Local
  id: string;
  discogsReleaseId: number;

  // Manual (preserved on import)
  purchasePrice?: number;
  purchaseDate?: string;
  storageLocation?: string;
  tags?: string[];
  notes?: string;

  // Discogs metadata
  artist: string;
  title: string;
  label?: string;
  catalogNumber?: string;
  releaseYear?: number;
  country?: string;
  format: string[];
  genres?: string[];
  styles?: string[];
  coverImageUrl?: string;
  mediaCondition: string;
  sleeveCondition: string;

  // Pricing
  estimatedValue?: number;
  suggestedPrice?: number;

  // Calculated
  gainLoss?: number;
  gainLossPercentage?: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastSyncedWithDiscogs?: string;
}
```

## 🐛 Troubleshooting

### Import Issues

**Problem:** Import fails or no data appears
**Solution:**
1. Check `.env` has correct `VITE_DISCOGS_TOKEN` and `VITE_DISCOGS_USERNAME`
2. Verify "Vinyl" folder exists in your Discogs collection
3. Check folder ID is 7559246 (or update in `import-collection.mjs`)

### Missing Prices

**Problem:** Some records show no estimated value
**Solution:** Not all releases have marketplace data. This is normal. Only 92/97 records have pricing in the example collection.

### Duplicate Dollar Signs

**Fixed!** Earlier versions showed "$ $20" due to both icon and text. Now uses DollarSign icon + number only.

### Stats Not Updating

**Problem:** Gain/Loss not appearing after adding purchase price
**Solution:** Run `node import-collection.mjs` after editing `vinyls.json` to recalculate.

## 🗺️ Roadmap

### Completed ✅
- [x] Discogs API integration
- [x] Marketplace pricing
- [x] Tron UI theme
- [x] Purchase price tracking with preservation
- [x] Gain/loss analytics
- [x] BBCode link parsing
- [x] Artist name cleaning
- [x] Clickable inter-linking
- [x] Stats dashboard
- [x] Clean cover art (no overlays)
- [x] Responsive design

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

## 📄 License

MIT License - feel free to fork for your own collection!

## 🙏 Credits

- **Built by**: [banastas](https://github.com/banastas)
- **Powered by**: [Discogs API](https://www.discogs.com/developers/)
- **Icons**: [Lucide](https://lucide.dev/)
- **Inspiration**: [comics.banast.as](https://comics.banast.as) architecture

## 📞 Support

- **Live Site**: https://vinyl.banast.as
- **Documentation**: See [PURCHASE_PRICE_GUIDE.md](PURCHASE_PRICE_GUIDE.md)

---

**Enjoy tracking your vinyl collection!** 🎵✨
