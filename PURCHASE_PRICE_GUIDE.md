# Purchase Price Tracking Guide

The import script now preserves manually-added purchase prices across Discogs imports.

## How to Add Purchase Prices

1. Open `src/data/vinyls.json` in your editor
2. Find the record you want to add a purchase price for
3. Add a `purchasePrice` field with a numeric value

### Example

```json
{
  "id": "5ba51fee-b257-447a-97e8-622819f25f1c",
  "discogsReleaseId": 18385729,
  "artist": "RZA",
  "title": "Ghost Dog: The Way Of The Samurai",
  "purchasePrice": 15.99,
  "estimatedValue": 19,
  ...
}
```

## What Happens on Import

When you run `node import-collection.mjs`:

- ✅ **Preserved fields** (won't be overwritten):
  - `purchasePrice` - Your manual purchase price
  - `purchaseDate` - When you added it to collection
  - `storageLocation` - Custom storage info
  - `tags` - Custom tags
  - `notes` - Your custom notes (Discogs notes won't overwrite)
  - `sleeveCondition` - Your condition rating
  - `mediaCondition` - Your condition rating

- 🔄 **Updated fields** (from Discogs):
  - `estimatedValue` - Latest marketplace pricing
  - `coverImageUrl` - Album artwork
  - All other metadata (artist, title, year, etc.)

- ✨ **Auto-calculated** (when purchasePrice exists):
  - `gainLoss` - Difference between estimated value and purchase price
  - `gainLossPercentage` - Percentage gain/loss

- ⚠️ **Only removed when**:
  - The vinyl is completely removed from your Discogs collection

## Example: Tracking Investment

1. Add purchase price to vinyls.json:
   ```json
   {
     "artist": "Pink Floyd",
     "title": "The Dark Side Of The Moon",
     "purchasePrice": 25.00,
     "estimatedValue": 45.00
   }
   ```

2. After import, the system will automatically calculate:
   - `gainLoss`: $20.00
   - `gainLossPercentage`: 80%

3. These will appear in:
   - The vinyl detail view
   - The stats dashboard (total gain/loss)
   - Top performers section

## Tips

- Purchase price is always in USD (matching Discogs marketplace)
- Use decimal values for cents (e.g., 15.99)
- Leave `purchasePrice` undefined if you don't want to track it
- You can bulk-edit the JSON file to add multiple purchase prices at once
