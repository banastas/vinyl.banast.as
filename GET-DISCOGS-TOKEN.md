# How to Get Your Discogs Personal Access Token

The **Consumer Key** and **Consumer Secret** you have are for OAuth authentication (multi-user apps). For personal use, you need a **Personal Access Token** instead.

## Steps to Get Your Token

1. **Go to Discogs Developer Settings**
   - Visit: https://www.discogs.com/settings/developers
   - Log in with your Discogs account

2. **Generate a Personal Access Token**
   - Scroll down to the **"Personal Access Tokens"** section
   - Click the **"Generate new token"** button
   - Give it a name (e.g., "Vinyl Collection Manager")
   - Click **"Generate Token"**

3. **Copy Your Token**
   - **Important**: Copy the token immediately!
   - You'll only see it once
   - It will look something like: `abcdefGHIJKLmnopQRSTuvwxYZ123456789ABCD`

4. **Update Your .env File**
   ```bash
   VITE_DISCOGS_TOKEN=your_personal_access_token_here
   VITE_DISCOGS_USERNAME=banastas
   ```

## What You Have vs. What You Need

### ❌ What You Have (Consumer Key/Secret - for OAuth)
```
Consumer Key: IlkMMMhQkNhBbfBVaqVq
Consumer Secret: kdFDswYzuWEYlMlyIHrxejZdBeTOJkTo
```
These are for building apps that let OTHER users log in.

### ✅ What You Need (Personal Access Token)
```
Personal Access Token: [A long string you generate from the settings page]
```
This is for accessing YOUR OWN collection.

## After Getting Your Token

1. **Update .env**:
   ```bash
   cd /Users/banastas/GitHub/vinyl.banast.as
   nano .env
   # Replace VITE_DISCOGS_TOKEN with your new token
   ```

2. **Test the connection**:
   ```bash
   open test-discogs.html
   # Or update the token in the HTML file
   ```

3. **Run the import**:
   ```bash
   DISCOGS_TOKEN=your_token_here node import-collection.mjs
   ```

   Or update the token in the script and run:
   ```bash
   node import-collection.mjs
   ```

## Need Help?

- Discogs API Documentation: https://www.discogs.com/developers/
- Authentication Guide: https://www.discogs.com/developers/#page:authentication

## Quick Test

Once you have your token, test it with curl:

```bash
curl "https://api.discogs.com/users/banastas" \
  -H "Authorization: Discogs token=YOUR_TOKEN_HERE" \
  -H "User-Agent: VinylBanastAs/1.0"
```

You should see your user profile info if the token works!
