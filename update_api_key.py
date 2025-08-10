#!/usr/bin/env python3
"""
Script to update the Google AI API key in the .env file
"""

import os
import re

def update_api_key():
    print("🔑 Google AI API Key Updater")
    print("=" * 40)
    
    # Get new API key from user
    new_key = input("Enter your new Google AI API key (starts with AIza...): ").strip()
    
    if not new_key:
        print("❌ No API key provided. Exiting.")
        return
    
    if not new_key.startswith("AIza"):
        print("⚠️  Warning: API key doesn't start with 'AIza'. Are you sure this is correct?")
        confirm = input("Continue anyway? (y/N): ").strip().lower()
        if confirm != 'y':
            print("❌ Cancelled.")
            return
    
    # Read current .env file
    env_path = ".env"
    if not os.path.exists(env_path):
        print(f"❌ .env file not found at {env_path}")
        return
    
    with open(env_path, 'r') as f:
        content = f.read()
    
    # Update the API key
    pattern = r'GOOGLE_AI_API_KEY=.*'
    replacement = f'GOOGLE_AI_API_KEY={new_key}'
    
    if re.search(pattern, content):
        new_content = re.sub(pattern, replacement, content)
    else:
        # Add the key if it doesn't exist
        new_content = content + f'\nGOOGLE_AI_API_KEY={new_key}\n'
    
    # Write back to file
    with open(env_path, 'w') as f:
        f.write(new_content)
    
    print("✅ API key updated successfully!")
    print("🔄 Please restart the server to use the new key:")
    print("   pkill -f uvicorn")
    print("   python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")

if __name__ == "__main__":
    update_api_key()
