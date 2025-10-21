# Deployment Guide for Cloudflare Pages

## TL;DR - No Secrets Needed!

**You do NOT need to add your Discogs Personal Access Token to Cloudflare Pages.**

Your collection is already stored in `src/data/vinyls.json` and will be deployed as a static file.

---

## Cloudflare Pages Setup

### 1. Build Settings

When setting up your Cloudflare Pages project, use these settings:

```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: (leave empty)
Node version: 18 or higher
```

### 2. Environment Variables

**Leave empty** - No environment variables needed!

- ❌ Do NOT add `VITE_DISCOGS_TOKEN`
- ❌ Do NOT add `VITE_DISCOGS_USERNAME`

Your `.env` file with the token stays on your local machine only.

---

## How It Works

### In Production (Cloudflare Pages):
- ✅ Loads 119 vinyl records from `vinyls.json`
- ✅ Full search, filtering, and browsing
- ✅ Stats dashboard
- ✅ All data stored in static JSON
- ℹ️ "Import from Discogs" button is hidden (no token available)

### On Your Local Machine:
- ✅ Same as production, PLUS:
- ✅ "Import from Discogs" button visible and functional
- ✅ Can sync with Discogs API using your Personal Access Token

---

## Updating Your Collection

When you add or remove vinyl records from your Discogs collection:

### Option 1: Local Import + Git Push (Recommended)

```bash
# 1. Import your updated collection locally
node import-collection.mjs

# 2. Commit the updated vinyls.json
git add src/data/vinyls.json
git commit -m "Update vinyl collection"
git push

# 3. Cloudflare Pages automatically rebuilds and deploys
```

### Option 2: Manual JSON Edit

Edit `src/data/vinyls.json` directly, commit, and push.

---

## Security Benefits

By NOT adding your token to Cloudflare:

✅ **Token never exposed** - Personal Access Token stays on your machine
✅ **No client-side API calls** - Faster page loads, no rate limits
✅ **Static site** - Better performance and caching
✅ **Lower costs** - No serverless functions needed

---

## First Deployment

1. **Connect your GitHub repo** to Cloudflare Pages
2. **Set build settings** as shown above
3. **Deploy** - No environment variables needed!
4. Your site will be live with all 119 vinyl records

---

## Need Help?

- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- Issues with this project: Create an issue in your GitHub repo

---

## What Gets Deployed

```
dist/
  ├── index.html          # Your app
  ├── assets/
  │   ├── index-*.js      # App bundle (includes vinyls.json data)
  │   ├── index-*.css     # Styles
  │   └── ...
  └── ...
```

All 119 vinyl records are bundled into the JavaScript and served statically.
