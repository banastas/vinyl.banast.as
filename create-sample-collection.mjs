#!/usr/bin/env node

/**
 * Create Sample Vinyl Collection
 *
 * This creates a sample collection with diverse vinyl records to test the app
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.join(__dirname, 'src', 'data', 'vinyls.json');

// Generate UUID (simple version)
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const sampleVinyls = [
  {
    id: generateId(),
    artist: 'Pink Floyd',
    artists: [{ id: 45467, name: 'Pink Floyd', role: undefined }],
    title: 'The Dark Side Of The Moon',
    label: 'Harvest',
    catalogNumber: 'SHVL 804',
    releaseYear: 1973,
    country: 'UK',
    format: ['LP', 'Album', 'Gatefold'],
    genres: ['Rock'],
    styles: ['Psychedelic Rock', 'Progressive Rock'],
    coverImageUrl: 'https://i.discogs.com/r7nTYgZ_hQqUMVBZz2J8LzsxkQo8vP0Qdi3qZVq0jaQ/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTE4NDI5/NDQtMTIzNzM0NTY3/OC5qcGVn.jpeg',
    sleeveCondition: 'Near Mint (NM)',
    mediaCondition: 'Near Mint (NM)',
    purchasePrice: 25.00,
    purchaseDate: '2023-06-15',
    purchaseCurrency: 'USD',
    storageLocation: 'Main Shelf A',
    tags: ['classic rock', 'essential'],
    notes: 'Original UK pressing, sounds amazing',
    estimatedValue: 45.00,
    gainLoss: 20.00,
    gainLossPercentage: 80.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    artist: 'Miles Davis',
    artists: [{ id: 28583, name: 'Miles Davis', role: undefined }],
    title: 'Kind Of Blue',
    label: 'Columbia',
    catalogNumber: 'CL 1355',
    releaseYear: 1959,
    country: 'US',
    format: ['LP', 'Album', 'Mono'],
    genres: ['Jazz'],
    styles: ['Modal', 'Cool Jazz'],
    coverImageUrl: 'https://i.discogs.com/AAJ1JqRUUW3L_l6Pv_DECMPSf3VVA6YPfYfZU0hVfmg/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTQyNzY2/MS0xMzk2NTEzNjEz/LTUxMTguanBlZw.jpeg',
    sleeveCondition: 'Very Good Plus (VG+)',
    mediaCondition: 'Very Good Plus (VG+)',
    purchasePrice: 150.00,
    purchaseDate: '2022-11-20',
    purchaseCurrency: 'USD',
    storageLocation: 'Jazz Collection',
    tags: ['jazz', 'essential', 'mono'],
    notes: 'Original 6-eye pressing, incredible condition for its age',
    estimatedValue: 220.00,
    gainLoss: 70.00,
    gainLossPercentage: 46.67,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    artist: 'Radiohead',
    artists: [{ id: 3840, name: 'Radiohead', role: undefined }],
    title: 'OK Computer',
    label: 'Parlophone',
    catalogNumber: '7243 8 55229 1 5',
    releaseYear: 1997,
    country: 'UK',
    format: ['2xLP', 'Album'],
    genres: ['Electronic', 'Rock'],
    styles: ['Alternative Rock', 'Experimental'],
    coverImageUrl: 'https://i.discogs.com/7W02k8MkRUWWmCn5gKLqjS_EvDOB71oJQPkxY9RQ4Pw/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTE4OTQy/MC0xMjMyMDMyODc1/LmpwZWc.jpeg',
    sleeveCondition: 'Mint (M)',
    mediaCondition: 'Mint (M)',
    purchasePrice: 35.00,
    purchaseDate: '2024-01-10',
    purchaseCurrency: 'USD',
    storageLocation: 'Main Shelf B',
    tags: ['90s', 'alternative'],
    notes: 'Reissue, sealed mint condition',
    estimatedValue: 40.00,
    gainLoss: 5.00,
    gainLossPercentage: 14.29,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    artist: 'Daft Punk',
    artists: [{ id: 1289, name: 'Daft Punk', role: undefined }],
    title: 'Random Access Memories',
    label: 'Columbia',
    catalogNumber: '88883716861',
    releaseYear: 2013,
    country: 'US',
    format: ['2xLP', 'Album', '180g'],
    genres: ['Electronic'],
    styles: ['Disco', 'House'],
    coverImageUrl: 'https://i.discogs.com/XYP5vZlXIxAhL2rH9t5B6P0VacwI3QNjLVPH9fVH2bI/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTQ1ODEz/OTEtMTM3MjE3Njgz/MC00Mjk1LmpwZWc.jpeg',
    sleeveCondition: 'Near Mint (NM)',
    mediaCondition: 'Near Mint (NM)',
    purchasePrice: 30.00,
    purchaseDate: '2023-08-05',
    purchaseCurrency: 'USD',
    storageLocation: 'Electronic Section',
    tags: ['electronic', 'modern'],
    notes: '180g pressing, fantastic sound quality',
    estimatedValue: 32.00,
    gainLoss: 2.00,
    gainLossPercentage: 6.67,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    artist: 'The Beatles',
    artists: [{ id: 82730, name: 'The Beatles', role: undefined }],
    title: 'Abbey Road',
    label: 'Apple Records',
    catalogNumber: 'PCS 7088',
    releaseYear: 1969,
    country: 'UK',
    format: ['LP', 'Album', 'Stereo'],
    genres: ['Rock'],
    styles: ['Pop Rock', 'Psychedelic Rock'],
    coverImageUrl: 'https://i.discogs.com/ZqDv7M0EkCNEhvTLHuDgGJYQYp5vQ5DIqzVhpKqPqAQ/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTQzNzgz/NjUtMTQyOTg3Mjcz/Ni0xNjA1LmpwZWc.jpeg',
    sleeveCondition: 'Very Good (VG)',
    mediaCondition: 'Very Good Plus (VG+)',
    purchasePrice: 45.00,
    purchaseDate: '2023-03-12',
    purchaseCurrency: 'USD',
    storageLocation: 'Main Shelf A',
    tags: ['classic rock', 'beatles', 'essential'],
    notes: 'Original UK pressing, some wear on sleeve but vinyl plays great',
    estimatedValue: 65.00,
    gainLoss: 20.00,
    gainLossPercentage: 44.44,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    artist: 'Kendrick Lamar',
    artists: [{ id: 1642681, name: 'Kendrick Lamar', role: undefined }],
    title: 'To Pimp A Butterfly',
    label: 'Top Dawg Entertainment',
    catalogNumber: 'B0022949-01',
    releaseYear: 2015,
    country: 'US',
    format: ['2xLP', 'Album'],
    genres: ['Hip Hop'],
    styles: ['Conscious', 'Jazz Rap'],
    coverImageUrl: 'https://i.discogs.com/K7mSB5pxK8HOFj8NdUIkWNwqsj6KKBHg4j6LqM6FVIA/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTY4Mjg1/NTQtMTQyNzM3NTAy/MC03NzgyLmpwZWc.jpeg',
    sleeveCondition: 'Mint (M)',
    mediaCondition: 'Mint (M)',
    purchasePrice: 28.00,
    purchaseDate: '2024-02-18',
    purchaseCurrency: 'USD',
    storageLocation: 'Hip Hop Section',
    tags: ['hip hop', 'modern classic'],
    notes: 'Still sealed, waiting for the right moment to open',
    estimatedValue: 35.00,
    gainLoss: 7.00,
    gainLossPercentage: 25.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    artist: 'Fleetwood Mac',
    artists: [{ id: 73564, name: 'Fleetwood Mac', role: undefined }],
    title: 'Rumours',
    label: 'Warner Bros. Records',
    catalogNumber: 'BSK 3010',
    releaseYear: 1977,
    country: 'US',
    format: ['LP', 'Album'],
    genres: ['Rock'],
    styles: ['Pop Rock', 'Soft Rock'],
    coverImageUrl: 'https://i.discogs.com/tKCqtgB6o3zBfBQjHBVWy5j86jGQxYo9MKxMwrNEvHE/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTY4NzI3/OS0xNDI2MDg4OTIw/LTkyMTMuanBlZw.jpeg',
    sleeveCondition: 'Near Mint (NM)',
    mediaCondition: 'Near Mint (NM)',
    purchasePrice: 18.00,
    purchaseDate: '2023-07-22',
    purchaseCurrency: 'USD',
    storageLocation: 'Main Shelf B',
    tags: ['70s', 'classic rock'],
    notes: 'Clean copy, one of my favorites',
    estimatedValue: 22.00,
    gainLoss: 4.00,
    gainLossPercentage: 22.22,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    artist: 'Nirvana',
    artists: [{ id: 251066, name: 'Nirvana', role: undefined }],
    title: 'Nevermind',
    label: 'DGC',
    catalogNumber: 'DGC-24425',
    releaseYear: 1991,
    country: 'US',
    format: ['LP', 'Album'],
    genres: ['Rock'],
    styles: ['Grunge', 'Alternative Rock'],
    coverImageUrl: 'https://i.discogs.com/WNP1QzG9FMr_dK-QFXHw0YVGM3xpYGRvFqNQoq6lVnk/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTE5NDIx/NTAtMTI0MjQ5NjMy/Mi5qcGVn.jpeg',
    sleeveCondition: 'Very Good Plus (VG+)',
    mediaCondition: 'Very Good Plus (VG+)',
    purchasePrice: 22.00,
    purchaseDate: '2023-09-30',
    purchaseCurrency: 'USD',
    storageLocation: 'Main Shelf C',
    tags: ['90s', 'grunge', 'essential'],
    notes: 'Original pressing, shows some age but plays well',
    estimatedValue: 30.00,
    gainLoss: 8.00,
    gainLossPercentage: 36.36,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

console.log('Creating sample vinyl collection...\n');
console.log(`Total records: ${sampleVinyls.length}`);

// Calculate some stats
const totalPurchaseValue = sampleVinyls.reduce((sum, v) => sum + v.purchasePrice, 0);
const totalCurrentValue = sampleVinyls.reduce((sum, v) => sum + v.estimatedValue, 0);
const totalGain = totalCurrentValue - totalPurchaseValue;

console.log(`Total purchase value: $${totalPurchaseValue.toFixed(2)}`);
console.log(`Total estimated value: $${totalCurrentValue.toFixed(2)}`);
console.log(`Total gain: $${totalGain.toFixed(2)} (+${((totalGain / totalPurchaseValue) * 100).toFixed(1)}%)`);

console.log(`\nWriting to ${OUTPUT_FILE}...`);
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sampleVinyls, null, 2), 'utf-8');

console.log('✓ Sample collection created!\n');
console.log('Next steps:');
console.log('  1. Run: npm run dev');
console.log('  2. Open: http://localhost:5173');
console.log('  3. View your sample collection!\n');
