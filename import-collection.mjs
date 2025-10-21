#!/usr/bin/env node

/**
 * Discogs Collection Importer
 *
 * This script imports your Discogs collection and saves it to src/data/vinyls.json
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN || 'jDfZllVMahoZvOMUkEPDzdoEqsirWAVzNfoFFqwY';
const DISCOGS_USERNAME = 'banastas';
const VINYL_FOLDER_ID = 7559246; // "Vinyl" folder - excludes CDs
const API_URL = 'https://api.discogs.com';
const OUTPUT_FILE = path.join(__dirname, 'src', 'data', 'vinyls.json');

// Rate limiting - be more conservative
const REQUESTS_PER_MINUTE = 50; // Conservative to avoid 429s
const DELAY_MS = Math.ceil(60000 / REQUESTS_PER_MINUTE);
const RATE_LIMIT_WAIT_MS = 65000; // Wait 65 seconds when hitting rate limit

// Helper to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Make API request with rate limiting and retry
async function makeRequest(endpoint, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Discogs token=${DISCOGS_TOKEN}`,
          'User-Agent': 'VinylBanastAs/1.0 +https://vinyl.banast.as'
        }
      });

      await sleep(DELAY_MS); // Rate limit
      return response.data;
    } catch (error) {
      if (error.response?.status === 429 && attempt < retries) {
        // Rate limited - wait and retry
        const waitTime = RATE_LIMIT_WAIT_MS * attempt;
        console.log(`\n  ⏳ Rate limited. Waiting ${waitTime / 1000}s before retry ${attempt}/${retries}...`);
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }
}

// Map Discogs condition to our VinylCondition type
function mapCondition(condition) {
  const conditionMap = {
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

  return conditionMap[condition] || 'Near Mint (NM)';
}

// Generate UUID (simple version)
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Map Discogs release to Vinyl format
function mapDiscogsToVinyl(release, collectionItem, prices, existingRecord = null) {
  const primaryArtist = release.artists?.[0]?.name || 'Unknown Artist';
  const artists = (release.artists || []).map(a => ({
    id: a.id,
    name: a.name,
    role: a.role
  }));

  const label = release.labels?.[0]?.name || '';
  const catalogNumber = release.labels?.[0]?.catno || '';
  const format = release.formats?.[0]?.descriptions || [release.formats?.[0]?.name || 'LP'];

  const coverImage = release.images?.find(img => img.type === 'primary')?.uri ||
                    release.images?.[0]?.uri ||
                    release.thumb ||
                    '';

  const mediaCondition = 'Near Mint (NM)';
  const sleeveCondition = 'Near Mint (NM)';

  // Get estimated value from marketplace stats
  let estimatedValue;
  let numForSale = 0;
  if (prices && prices.lowest_price) {
    // Use lowest current asking price as estimated value
    estimatedValue = prices.lowest_price.value;
    numForSale = prices.num_for_sale || 0;
  }

  const now = new Date().toISOString();

  // Preserve manual edits from existing record
  const preservedFields = existingRecord ? {
    id: existingRecord.id,
    purchasePrice: existingRecord.purchasePrice, // Preserve manual purchase price
    purchaseDate: existingRecord.purchaseDate,
    storageLocation: existingRecord.storageLocation,
    tags: existingRecord.tags,
    notes: existingRecord.notes || release.notes || '', // Use existing notes if set
    sleeveCondition: existingRecord.sleeveCondition,
    mediaCondition: existingRecord.mediaCondition,
    createdAt: existingRecord.createdAt,
  } : {
    id: generateId(),
    purchasePrice: undefined, // No purchase price by default
    purchaseDate: collectionItem?.date_added || now,
    storageLocation: '',
    tags: [],
    notes: release.notes || '',
    sleeveCondition: sleeveCondition,
    mediaCondition: mediaCondition,
    createdAt: now,
  };

  // Calculate gain/loss if purchase price exists
  const gainLoss = preservedFields.purchasePrice && estimatedValue
    ? estimatedValue - preservedFields.purchasePrice
    : undefined;
  const gainLossPercentage = preservedFields.purchasePrice && gainLoss !== undefined
    ? (gainLoss / preservedFields.purchasePrice) * 100
    : undefined;

  return {
    ...preservedFields,
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
    purchaseCurrency: 'USD',
    suggestedPrice: estimatedValue,
    estimatedValue: estimatedValue,
    gainLoss: gainLoss,
    gainLossPercentage: gainLossPercentage,
    lastPriceUpdate: prices ? now : undefined,
    lastSyncedWithDiscogs: now,
    updatedAt: now
  };
}

// Load existing collection to preserve manual data
function loadExistingCollection() {
  try {
    const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    // Create a map of discogsReleaseId -> existing record
    const map = new Map();
    existing.forEach(record => {
      if (record.discogsReleaseId) {
        map.set(record.discogsReleaseId, record);
      }
    });
    return map;
  } catch (error) {
    return new Map();
  }
}

// Main import function
async function importCollection() {
  console.log('🎵 Starting Discogs collection import...\n');

  // Load existing collection to preserve manual edits
  const existingRecords = loadExistingCollection();
  console.log(`📂 Found ${existingRecords.size} existing records to preserve manual data\n`);
  console.log(`Username: ${DISCOGS_USERNAME}`);
  console.log(`Token: ${DISCOGS_TOKEN.substring(0, 4)}...${DISCOGS_TOKEN.substring(DISCOGS_TOKEN.length - 4)}\n`);

  try {
    // Test authentication
    console.log('Testing authentication...');
    const user = await makeRequest(`/users/${DISCOGS_USERNAME}`);
    console.log(`✓ Authenticated as ${user.username}`);

    // Get folder info
    const foldersData = await makeRequest(`/users/${DISCOGS_USERNAME}/collection/folders`);
    const vinylFolder = foldersData.folders.find(f => f.id === VINYL_FOLDER_ID);
    console.log(`  Vinyl folder: "${vinylFolder.name}" (ID: ${VINYL_FOLDER_ID})`);
    console.log(`  Vinyl records: ${vinylFolder.count}\n`);

    // Get collection
    console.log('Fetching collection...');
    const vinyls = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`  Fetching page ${page}...`);
      const response = await makeRequest(
        `/users/${DISCOGS_USERNAME}/collection/folders/${VINYL_FOLDER_ID}/releases?page=${page}&per_page=100`
      );

      const total = response.pagination.items;
      const releases = response.releases;

      console.log(`  Got ${releases.length} releases (${vinyls.length + releases.length}/${total})`);

      for (const item of releases) {
        const releaseId = item.basic_information.id;
        const artist = item.basic_information.artists[0]?.name || 'Unknown';
        const title = item.basic_information.title;

        process.stdout.write(`    Importing: ${artist} - ${title}...`);

        try {
          // Get full release details
          const release = await makeRequest(`/releases/${releaseId}`);

          // Try to get marketplace stats (current prices)
          let marketStats;
          try {
            marketStats = await makeRequest(`/marketplace/stats/${releaseId}`);
          } catch (error) {
            // Marketplace stats not available for this release
          }

          // Get existing record to preserve manual edits
          const existingRecord = existingRecords.get(releaseId);

          // Map to vinyl format
          const vinyl = mapDiscogsToVinyl(release, item, marketStats, existingRecord);
          vinyls.push(vinyl);

          console.log(` ✓`);

          // Save progress every 10 records
          if (vinyls.length % 10 === 0) {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(vinyls, null, 2), 'utf-8');
            console.log(`    💾 Progress saved (${vinyls.length} records)`);
          }
        } catch (error) {
          console.log(` ✗ ${error.message}`);
        }
      }

      hasMore = response.pagination.page < response.pagination.pages;
      page++;
    }

    // Save to file
    console.log(`\nSaving ${vinyls.length} records to ${OUTPUT_FILE}...`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(vinyls, null, 2), 'utf-8');
    console.log('✓ Saved!\n');

    // Summary
    console.log('📊 Import Summary:');
    console.log(`  Total records: ${vinyls.length}`);
    console.log(`  With prices: ${vinyls.filter(v => v.estimatedValue).length}`);
    console.log(`  With cover art: ${vinyls.filter(v => v.coverImageUrl).length}`);
    console.log(`  Genres: ${new Set(vinyls.flatMap(v => v.genres)).size}`);
    console.log(`  Labels: ${new Set(vinyls.map(v => v.label)).size}`);
    console.log(`  Artists: ${new Set(vinyls.map(v => v.artist)).size}`);

    // Value stats if available
    const withValue = vinyls.filter(v => v.estimatedValue);
    if (withValue.length > 0) {
      const totalValue = withValue.reduce((sum, v) => sum + v.estimatedValue, 0);
      const avgValue = totalValue / withValue.length;
      const maxValue = Math.max(...withValue.map(v => v.estimatedValue));

      console.log(`\n💰 Value Statistics:`);
      console.log(`  Total estimated value: $${totalValue.toFixed(2)}`);
      console.log(`  Average value: $${avgValue.toFixed(2)}`);
      console.log(`  Highest value: $${maxValue.toFixed(2)}`);
    }

    console.log('\n✅ Import complete!');
    console.log('\nNext steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Open: http://localhost:5173');
    console.log('  3. View your collection!\n');

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.statusText);
      if (error.response.data) {
        console.error('Details:', error.response.data);
      }
    }
    process.exit(1);
  }
}

// Run import
importCollection().catch(console.error);
