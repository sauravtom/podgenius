# 🎬 YouTube OAuth2 Setup Guide

## 📋 Complete YouTube Upload Integration

This guide will help you set up YouTube OAuth2 authentication to enable automatic video uploads from your Podgenius app. The tokens will be stored as environment variables for security and ease of deployment.

## 🔧 Prerequisites

1. **Google Cloud Console Access**
2. **Python 3.7+** installed
3. **YouTube Channel** (the account you want to upload to)

## 📥 Step 1: Download OAuth2 Credentials

### 1.1 Google Cloud Console Setup
```bash
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing project
3. Enable "YouTube Data API v3"
4. Go to "APIs & Services" > "Credentials"
5. Click "Create Credentials" > "OAuth 2.0 Client ID"
6. Choose "Desktop Application"
7. Download the JSON file
```

### 1.2 File Setup
```bash
1. Rename the downloaded file to: hackathon_client_secrets.json
2. Place it in your project root directory (same level as package.json)
```

## 🐍 Step 2: Install Python Dependencies

```bash
# Install required Python packages
pip install -r youtube_requirements.txt

# Or install manually:
pip install google-auth-oauthlib google-api-python-client google-auth
```

## 🔐 Step 3: Run Authentication Setup

```bash
# Run the authentication script
python youtube_auth_setup.py
```

### What happens:
1. **Browser Opens**: You'll be redirected to Google OAuth consent
2. **Login**: Sign in with the Google account that has your YouTube channel
3. **Grant Permission**: Allow access to YouTube upload permissions
4. **Token Generated**: `token.json` file is created automatically
5. **Add to Environment**: Copy the token values to your `.env.local` file

### Expected Output:
```
🎬 YouTube Authentication Setup
========================================
🔐 Starting OAuth2 authentication flow...
📱 Your browser will open for authentication
✅ Authentication successful!
💾 Credentials saved to token.json

🧪 Testing connection...
🎉 Successfully connected to YouTube!
📺 Channel: Your Channel Name
🆔 Channel ID: UCxxxxxxxxxxxxxxxxx

✅ Setup complete!
🚀 You can now use YouTube uploads in your app
📁 Keep token.json secure and don't commit to git

### 🔐 Add Tokens to Environment Variables

After successful authentication, add these values to your `client/.env.local` file:

```env
GOOGLE_ACCESS_TOKEN=ya29.a0AS3H6Nz...
GOOGLE_REFRESH_TOKEN=1//0grr_kPxHR...
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_SCOPES=https://www.googleapis.com/auth/youtube.upload,https://www.googleapis.com/auth/youtube
GOOGLE_TOKEN_EXPIRY=2025-07-13T21:30:16Z
```

**Note**: Copy the actual values from your generated `token.json` file.
```

## 🚀 Step 4: Test YouTube Upload

1. **Restart your Next.js app**:
   ```bash
   cd client && npm run dev
   ```

2. **Generate a podcast** - YouTube upload should now work!

3. **Check logs** for successful upload:
   ```
   ✅ YouTube OAuth2 credentials loaded from environment variables
   YouTube Configuration Check: { hasTokens: true, hasYouTubeClient: true }
   📤 Starting YouTube upload...
   ✅ YouTube upload successful: https://www.youtube.com/watch?v=...
   ✅ Video added to playlist: https://www.youtube.com/playlist?list=...
   ```

## 📁 File Structure

After setup, your project should have:
```
podgenius/
├── hackathon_client_secrets.json  # OAuth2 credentials (don't commit)
├── token.json                     # Access tokens (generated, don't commit)
├── youtube_auth_setup.py          # Authentication script
├── youtube_requirements.txt       # Python dependencies
├── client/
│   └── .env.local                 # Environment variables with tokens
└── ...
```

**Important**: The tokens are now read from environment variables in `.env.local`, making deployment easier and more secure.

## 🔒 Security Notes

### ⚠️ Important Files to Keep Private:
- `hackathon_client_secrets.json` - OAuth2 client credentials
- `token.json` - Access and refresh tokens

### 🛡️ Add to .gitignore:
```gitignore
# YouTube OAuth2 files
hackathon_client_secrets.json
token.json
```

## 🔄 Token Refresh

The `token.json` includes refresh tokens, so it should automatically refresh when needed. If you get authentication errors:

1. **Delete token.json**
2. **Run authentication again**:
   ```bash
   python youtube_auth_setup.py
   ```

## 🧪 Troubleshooting

### Problem: "hackathon_client_secrets.json not found"
**Solution**: Download OAuth2 credentials from Google Cloud Console

### Problem: "No YouTube channel found"
**Solution**: Make sure you're logging in with an account that has a YouTube channel

### Problem: "token.json not found" 
**Solution**: Run `python youtube_auth_setup.py` to authenticate

### Problem: "Invalid credentials"
**Solution**: Delete `token.json` and re-authenticate

## 🎯 Features Enabled

Once setup is complete, your app will have:

- ✅ **Automatic YouTube Uploads**: Videos uploaded to authenticated channel
- ✅ **Playlist Management**: Auto-creates user-specific playlists
- ✅ **Rich Metadata**: Enhanced titles, descriptions, and tags
- ✅ **Public Videos**: Uploaded as public for maximum reach
- ✅ **Error Handling**: Graceful failures with detailed logging

## 🚀 Production Deployment

For production deployment:

1. **Keep credentials secure**: Use environment variables or secure storage
2. **Handle token refresh**: Implement automatic token refresh logic
3. **Multiple users**: Each user needs their own OAuth2 flow
4. **Rate limits**: Implement proper rate limiting for YouTube API

## 💡 Alternative: Manual Upload

If OAuth2 setup is too complex, users can always:
1. Generate podcasts normally
2. Download the MP4 video
3. Upload manually to YouTube

The core podcast generation works perfectly without YouTube integration!

---

## 🎉 Ready to Go!

Once you complete this setup, your Podgenius app will have **full YouTube integration** with automatic uploads, playlist management, and rich metadata! 🎬🚀 