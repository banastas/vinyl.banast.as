#!/usr/bin/env node

/**
 * Import New Vinyls from Discogs
 *
 * This script ONLY imports vinyls from your Discogs collection that don't already
 * exist in vinyls.json. It will NOT modify any existing records.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN;
const DISCOGS_USERNAME = process.env.DISCOGS_USERNAME;
const VINYL_FOLDER_ID = process.env.VINYL_FOLDER_ID || 7559246; // Default: "Vinyl" folder
const VINYLS_FILE = path.join(__dirname, 'src', 'data', 'vinyls.json');

// Validate required environment variables
if (!DISCOGS_TOKEN) {
  console.error('❌ Error: DISCOGS_TOKEN environment variable is required');
  console.error('   Set it in .env file or run: export DISCOGS_TOKEN=your_token_here');
  process.exit(1);
}

if (!DISCOGS_USERNAME) {
  console.error('❌ Error: DISCOGS_USERNAME environment variable is required');
  console.error('   Set it in .env file or run: export DISCOGS_USERNAME=your_username');
  process.exit(1);
}

const API_URL = 'https://api.discogs.com';

// Rate limiting
const REQUESTS_PER_MINUTE = 50;
const DELAY_MS = Math.ceil(60000 / REQUESTS_PER_MINUTE);
const RATE_LIMIT_WAIT_MS = 65000;

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
        const waitTime = RATE_LIMIT_WAIT_MS * attempt;
        console.log(`\n  ⏳ Rate limited. Waiting ${waitTime / 1000}s before retry ${attempt}/${retries}...`);
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }
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
function mapDiscogsToVinyl(release, collectionItem, prices) {
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
  if (prices && prices.lowest_price) {
    estimatedValue = prices.lowest_price.value;
  }

  const now = new Date().toISOString();

  return {
    id: generateId(),
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
    purchaseDate: collectionItem?.date_added || now,
    purchaseCurrency: 'USD',
    // purchasePrice: undefined, // User will fill this in manually
    suggestedPrice: estimatedValue,
    estimatedValue: estimatedValue,
    // gainLoss: undefined, // Will be calculated once purchasePrice is added
    // gainLossPercentage: undefined,
    sleeveCondition: sleeveCondition,
    mediaCondition: mediaCondition,
    storageLocation: '',
    tags: [],
    notes: release.notes || '',
    lastPriceUpdate: prices ? now : undefined,
    lastSyncedWithDiscogs: now,
    createdAt: now,
    updatedAt: now
  };
}

// Import only new vinyls
async function importNewVinyls() {
  console.log('🆕 Importing new vinyls from Discogs...\n');

  try {
    // Load existing collection
    let existingVinyls = [];
    try {
      existingVinyls = JSON.parse(fs.readFileSync(VINYLS_FILE, 'utf-8'));
    } catch (error) {
      console.log('📂 No existing collection found, will create new file\n');
    }

    // Create a set of existing Discogs release IDs
    const existingIds = new Set(
      existingVinyls
        .filter(v => v.discogsReleaseId)
        .map(v => v.discogsReleaseId)
    );

    console.log(`📂 Found ${existingVinyls.length} existing records\n`);
    console.log(`Username: ${DISCOGS_USERNAME}`);
    console.log(`Token: ${DISCOGS_TOKEN.substring(0, 4)}...${DISCOGS_TOKEN.substring(DISCOGS_TOKEN.length - 4)}\n`);

    // Test authentication
    console.log('Testing authentication...');
    const user = await makeRequest(`/users/${DISCOGS_USERNAME}`);
    console.log(`✓ Authenticated as ${user.username}`);

    // Get folder info
    const foldersData = await makeRequest(`/users/${DISCOGS_USERNAME}/collection/folders`);
    const vinylFolder = foldersData.folders.find(f => f.id === VINYL_FOLDER_ID);
    console.log(`  Vinyl folder: "${vinylFolder.name}" (ID: ${VINYL_FOLDER_ID})`);
    console.log(`  Vinyl records in Discogs: ${vinylFolder.count}\n`);

    // Get collection from Discogs
    console.log('Fetching collection from Discogs...');
    const newVinyls = [];
    let page = 1;
    let hasMore = true;
    let checkedCount = 0;
    let skippedCount = 0;

    while (hasMore) {
      console.log(`  Fetching page ${page}...`);
      const response = await makeRequest(
        `/users/${DISCOGS_USERNAME}/collection/folders/${VINYL_FOLDER_ID}/releases?page=${page}&per_page=100`
      );

      const total = response.pagination.items;
      const releases = response.releases;

      console.log(`  Got ${releases.length} releases (${checkedCount + releases.length}/${total})`);

      for (const item of releases) {
        const releaseId = item.basic_information.id;
        const artist = item.basic_information.artists[0]?.name || 'Unknown';
        const title = item.basic_information.title;

        checkedCount++;

        // Skip if already exists
        if (existingIds.has(releaseId)) {
          console.log(`⊘ [${checkedCount}/${total}] Already exists: ${artist} - ${title}`);
          skippedCount++;
          continue;
        }

        process.stdout.write(`✨ [${checkedCount}/${total}] NEW: ${artist} - ${title}...`);

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

          // Map to vinyl format
          const vinyl = mapDiscogsToVinyl(release, item, marketStats);
          newVinyls.push(vinyl);

          console.log(` ✓`);

        } catch (error) {
          console.log(` ✗ ${error.message}`);
        }
      }

      hasMore = response.pagination.page < response.pagination.pages;
      page++;
    }

    // Merge and save
    if (newVinyls.length > 0) {
      const allVinyls = [...existingVinyls, ...newVinyls];

      console.log(`\n💾 Saving ${newVinyls.length} new records...`);
      fs.writeFileSync(VINYLS_FILE, JSON.stringify(allVinyls, null, 2), 'utf-8');
      console.log('✓ Saved!\n');

      // Summary
      console.log('📊 Import Summary:');
      console.log(`  Checked: ${checkedCount}`);
      console.log(`  Already existed: ${skippedCount}`);
      console.log(`  New records imported: ${newVinyls.length}`);
      console.log(`  Total records now: ${allVinyls.length}`);

      // New vinyls stats
      console.log(`\n🆕 New Vinyls:`);
      console.log(`  With prices: ${newVinyls.filter(v => v.estimatedValue).length}`);
      console.log(`  With cover art: ${newVinyls.filter(v => v.coverImageUrl).length}`);
      console.log(`  Genres: ${new Set(newVinyls.flatMap(v => v.genres)).size}`);
      console.log(`  Labels: ${new Set(newVinyls.map(v => v.label)).size}`);

      const withValue = newVinyls.filter(v => v.estimatedValue);
      if (withValue.length > 0) {
        const totalValue = withValue.reduce((sum, v) => sum + v.estimatedValue, 0);
        const avgValue = totalValue / withValue.length;
        const maxValue = Math.max(...withValue.map(v => v.estimatedValue));

        console.log(`\n💰 New Vinyls Value:`);
        console.log(`  Total estimated value: $${totalValue.toFixed(2)}`);
        console.log(`  Average value: $${avgValue.toFixed(2)}`);
        console.log(`  Highest value: $${maxValue.toFixed(2)}`);
      }

      console.log('\n✅ Import complete!');
      console.log('\n💡 Note: Remember to add purchase prices manually for the new vinyls');

    } else {
      console.log(`\n✅ No new vinyls found - your collection is up to date!`);
      console.log(`  All ${checkedCount} records from Discogs already exist locally.`);
    }

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
importNewVinyls().catch(console.error);
