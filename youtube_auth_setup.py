#!/usr/bin/env python3
"""
YouTube OAuth2 Authentication Setup Script
This script generates the token.json file needed for YouTube uploads.
"""

import os
import json
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

# YouTube API scopes
SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube"
]

def get_authenticated_service():
    """
    Authenticate with YouTube API and return service object.
    Creates token.json file for future use.
    """
    creds = None
    
    # Check if token.json already exists
    if os.path.exists("token.json"):
        print("📄 Found existing token.json file")
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
        
        # Check if credentials are valid
        if creds and creds.valid:
            print("✅ Existing credentials are valid!")
            return build("youtube", "v3", credentials=creds)
        else:
            print("⚠️ Existing credentials are invalid, re-authenticating...")

    # If no valid credentials, run OAuth flow
    if not creds or not creds.valid:
        if not os.path.exists("hackathon_client_secrets.json"):
            print("❌ Error: hackathon_client_secrets.json not found!")
            print("📥 Please download this file from Google Cloud Console:")
            print("   1. Go to https://console.cloud.google.com/")
            print("   2. Navigate to APIs & Services > Credentials")
            print("   3. Download your OAuth 2.0 Client ID JSON file")
            print("   4. Rename it to 'hackathon_client_secrets.json'")
            print("   5. Place it in the project root directory")
            return None
        
        print("🔐 Starting OAuth2 authentication flow...")
        print("📱 Your browser will open for authentication")
        
        flow = InstalledAppFlow.from_client_secrets_file(
            "hackathon_client_secrets.json", 
            SCOPES
        )
        
        # Run local server for OAuth callback
        creds = flow.run_local_server(
            port=8080, 
            access_type='offline', 
            prompt='consent'
        )
        
        # Save credentials for future use
        with open("token.json", "w") as token:
            token.write(creds.to_json())
        
        print("✅ Authentication successful!")
        print("💾 Credentials saved to token.json")

    return build("youtube", "v3", credentials=creds)

def test_youtube_connection():
    """Test the YouTube API connection"""
    try:
        youtube = get_authenticated_service()
        if not youtube:
            return False
            
        # Test API call - get channel info
        request = youtube.channels().list(part="snippet", mine=True)
        response = request.execute()
        
        if response.get("items"):
            channel = response["items"][0]
            channel_name = channel["snippet"]["title"]
            channel_id = channel["id"]
            
            print(f"🎉 Successfully connected to YouTube!")
            print(f"📺 Channel: {channel_name}")
            print(f"🆔 Channel ID: {channel_id}")
            return True
        else:
            print("❌ No YouTube channel found for this account")
            return False
            
    except Exception as e:
        print(f"❌ Error testing YouTube connection: {e}")
        return False

def main():
    """Main function to run authentication setup"""
    print("🎬 YouTube Authentication Setup")
    print("=" * 40)
    
    # Check for required files
    if not os.path.exists("hackathon_client_secrets.json"):
        print("❌ Missing hackathon_client_secrets.json")
        print("\n📋 Setup Instructions:")
        print("1. Go to Google Cloud Console")
        print("2. Create OAuth 2.0 credentials")
        print("3. Download the JSON file")
        print("4. Rename to 'hackathon_client_secrets.json'")
        print("5. Place in project root")
        print("6. Run this script again")
        return
    
    # Run authentication
    youtube = get_authenticated_service()
    if youtube:
        print("\n🧪 Testing connection...")
        if test_youtube_connection():
            print("\n✅ Setup complete!")
            print("🚀 You can now use YouTube uploads in your app")
            print("📁 Keep token.json secure and don't commit to git")
        else:
            print("\n❌ Setup failed - connection test unsuccessful")
    else:
        print("\n❌ Authentication failed")

if __name__ == "__main__":
    main() 