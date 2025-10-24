#!/usr/bin/env node

/**
 * Update Vinyl Prices from Discogs
 *
 * This script ONLY updates estimated values and market prices for existing records.
 * It preserves ALL other fields including purchasePrice, notes, tags, etc.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN;
const VINYLS_FILE = path.join(__dirname, 'src', 'data', 'vinyls.json');

// Validate required environment variables
if (!DISCOGS_TOKEN) {
  console.error('❌ Error: DISCOGS_TOKEN environment variable is required');
  console.error('   Set it in .env file or run: export DISCOGS_TOKEN=your_token_here');
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
      // If marketplace stats not found, return null instead of throwing
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

// Update prices for existing records
async function updatePrices() {
  console.log('💰 Updating vinyl prices from Discogs...\n');

  try {
    // Load existing collection
    const vinyls = JSON.parse(fs.readFileSync(VINYLS_FILE, 'utf-8'));
    console.log(`📂 Loaded ${vinyls.length} records\n`);

    let updated = 0;
    let failed = 0;
    let skipped = 0;
    const now = new Date().toISOString();

    for (let i = 0; i < vinyls.length; i++) {
      const vinyl = vinyls[i];

      if (!vinyl.discogsReleaseId) {
        console.log(`⊘ [${i + 1}/${vinyls.length}] Skipping: ${vinyl.artist} - ${vinyl.title} (no Discogs ID)`);
        skipped++;
        continue;
      }

      process.stdout.write(`💵 [${i + 1}/${vinyls.length}] ${vinyl.artist} - ${vinyl.title}...`);

      try {
        // Get marketplace stats (current prices)
        const marketStats = await makeRequest(`/marketplace/stats/${vinyl.discogsReleaseId}`);

        if (marketStats && marketStats.lowest_price) {
          const oldValue = vinyl.estimatedValue;
          const newValue = marketStats.lowest_price.value;

          // Update price fields only
          vinyl.estimatedValue = newValue;
          vinyl.suggestedPrice = newValue;
          vinyl.lastPriceUpdate = now;
          vinyl.updatedAt = now;

          // Recalculate gain/loss if purchasePrice exists
          if (vinyl.purchasePrice) {
            vinyl.gainLoss = newValue - vinyl.purchasePrice;
            vinyl.gainLossPercentage = (vinyl.gainLoss / vinyl.purchasePrice) * 100;
          }

          const change = oldValue ? ((newValue - oldValue) / oldValue * 100).toFixed(1) : 'N/A';
          console.log(` ✓ $${oldValue?.toFixed(2) || 'N/A'} → $${newValue.toFixed(2)} (${change}%)`);
          updated++;
        } else {
          console.log(` ⊘ No market data available`);
          skipped++;
        }

        // Save progress every 10 records
        if ((i + 1) % 10 === 0) {
          fs.writeFileSync(VINYLS_FILE, JSON.stringify(vinyls, null, 2), 'utf-8');
          console.log(`    💾 Progress saved (${i + 1}/${vinyls.length})`);
        }

      } catch (error) {
        console.log(` ✗ ${error.message}`);
        failed++;
      }
    }

    // Save final results
    console.log(`\n💾 Saving updated prices...`);
    fs.writeFileSync(VINYLS_FILE, JSON.stringify(vinyls, null, 2), 'utf-8');
    console.log('✓ Saved!\n');

    // Summary
    console.log('📊 Update Summary:');
    console.log(`  Total records: ${vinyls.length}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`  Failed: ${failed}`);

    // Value stats
    const withValue = vinyls.filter(v => v.estimatedValue);
    if (withValue.length > 0) {
      const totalValue = withValue.reduce((sum, v) => sum + v.estimatedValue, 0);
      const avgValue = totalValue / withValue.length;
      const maxValue = Math.max(...withValue.map(v => v.estimatedValue));

      console.log(`\n💰 Collection Value:`);
      console.log(`  Total estimated value: $${totalValue.toFixed(2)}`);
      console.log(`  Average value: $${avgValue.toFixed(2)}`);
      console.log(`  Highest value: $${maxValue.toFixed(2)}`);

      // Calculate total gain/loss if purchase prices exist
      const withPurchasePrice = vinyls.filter(v => v.purchasePrice && v.estimatedValue);
      if (withPurchasePrice.length > 0) {
        const totalPurchase = withPurchasePrice.reduce((sum, v) => sum + v.purchasePrice, 0);
        const totalCurrent = withPurchasePrice.reduce((sum, v) => sum + v.estimatedValue, 0);
        const totalGain = totalCurrent - totalPurchase;
        const totalGainPct = (totalGain / totalPurchase) * 100;

        console.log(`\n📈 Investment Performance:`);
        console.log(`  Total invested: $${totalPurchase.toFixed(2)}`);
        console.log(`  Current value: $${totalCurrent.toFixed(2)}`);
        console.log(`  Gain/Loss: $${totalGain.toFixed(2)} (${totalGainPct.toFixed(1)}%)`);
      }
    }

    console.log('\n✅ Price update complete!');

  } catch (error) {
    console.error('\n❌ Update failed:', error.message);
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.statusText);
    }
    process.exit(1);
  }
}

// Run update
updatePrices().catch(console.error);
