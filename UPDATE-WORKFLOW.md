# How to Update Your Vinyl Collection

## Quick Guide

When you add or remove vinyl records from your Discogs collection:

### Step 1: Import Locally

```bash
cd /Users/banastas/GitHub/vinyl.banast.as
node import-collection.mjs
```

This will:
- ✅ Fetch all 119+ records from your Discogs collection
- ✅ Save to `src/data/vinyls.json`
- ✅ Auto-save progress every 10 records
- ✅ Automatically retry if it hits rate limits (waits 65 seconds)

### Step 2: Commit and Push

```bash
git add src/data/vinyls.json
git commit -m "Update vinyl collection"
git push
```

### Step 3: Deploy

Cloudflare Pages will automatically:
- ✅ Detect the push
- ✅ Run `npm run build`
- ✅ Deploy your updated collection
- ✅ Your site is live in ~2 minutes!

---

## That's It!

Your Personal Access Token stays on your local machine. The live site loads from the static `vinyls.json` file - fast, secure, and simple.

---

## Troubleshooting

### Rate Limit Errors

If you see `429 Too Many Requests` errors:
- ✅ The script automatically waits 65 seconds and retries
- ✅ Progress is saved every 10 records, so you won't lose data
- ✅ Just let it run - it will complete eventually

### Import Script Not Found

Make sure you're in the project directory:
```bash
cd /Users/banastas/GitHub/vinyl.banast.as
```

### Collection Not Updating

Clear your browser cache or hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows).

---

## Advanced: Testing Locally

Want to preview before deploying?

```bash
# Start dev server
npm run dev

# Open browser to http://localhost:5173
# The Import button will be visible since you have the token
```

---

## File Reference

- `src/data/vinyls.json` - Your collection data (commit this)
- `.env` - Your Discogs token (NEVER commit this - already in .gitignore)
- `import-collection.mjs` - Import script
- `DEPLOYMENT.md` - Cloudflare Pages setup guide
