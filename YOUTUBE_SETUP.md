# YouTube Upload Setup Guide

## 🎥 Setting Up YouTube Integration

Currently, YouTube upload is **disabled** because it requires proper OAuth2 authentication. Here's how to enable it:

## 📋 Current Status

- ✅ **Video Generation**: Working perfectly
- ✅ **Audio Generation**: Working perfectly  
- ❌ **YouTube Upload**: Requires authentication setup

## 🔧 Option 1: OAuth2 Flow (Recommended for Production)

### 1. **Google Cloud Console Setup**
```bash
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create OAuth2 credentials (Web application)
5. Add authorized redirect URIs:
   - http://localhost:3000/api/auth/callback
   - https://yourdomain.com/api/auth/callback
```

### 2. **Update Environment Variables**
```env
# Add to your .env.local
GOOGLE_CLIENT_ID=your_oauth2_client_id
GOOGLE_CLIENT_SECRET=your_oauth2_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

### 3. **Implement OAuth2 Flow**
You'll need to create authentication endpoints:
- `/api/auth/youtube-connect` - Initiate OAuth2 flow
- `/api/auth/callback` - Handle OAuth2 callback
- Store access/refresh tokens securely

## 🔧 Option 2: Service Account (Easier Setup)

### 1. **Create Service Account**
```bash
1. Go to Google Cloud Console
2. IAM & Admin → Service Accounts
3. Create new service account
4. Download JSON key file
5. Enable YouTube Data API v3
```

### 2. **Update Code for Service Account**
```javascript
// Replace OAuth2 with service account
const auth = new google.auth.GoogleAuth({
  keyFile: 'path/to/service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/youtube.upload']
});
```

## 🔧 Option 3: Skip YouTube Upload (Current Default)

The app works perfectly without YouTube upload:
- ✅ Generates audio podcasts
- ✅ Creates video with static image
- ✅ Provides downloadable content
- ✅ Shows content in browser

## 🚀 Quick Fix for Now

To continue using the app without YouTube:

1. **Keep current setup** - everything works except YouTube upload
2. **Download videos manually** - use the download button
3. **Upload to YouTube manually** - drag & drop the downloaded video

## 💡 Implementation Priority

1. **High Priority**: Audio + Video generation (✅ Working)
2. **Medium Priority**: OAuth2 flow for YouTube
3. **Low Priority**: Advanced YouTube features (playlists, etc.)

## 🔍 Debugging Current Issue

The error "No access, refresh token, API key or refresh handler callback is set" means:
- OAuth2 client has credentials but no user authorization
- Need to complete OAuth2 flow to get access tokens
- Or switch to service account authentication

## 📝 Next Steps

Choose one approach:
1. **Continue without YouTube** (recommended for now)
2. **Implement OAuth2 flow** (for production)
3. **Use service account** (for testing)

The core podcast generation functionality is working perfectly! 🎉 