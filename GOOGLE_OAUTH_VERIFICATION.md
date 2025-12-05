# Fixing "Google verification process not complete" Error

When you see this error, it's because your OAuth app is in testing mode and needs configuration.

## Solution 1: Add Test Users (Recommended for Personal Use)

1. Go to [Google Cloud Console - OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)

2. Under **Publishing status**, you should see "Testing"

3. Scroll down to **Test users** section

4. Click **"+ ADD USERS"**

5. Add your Google account email address (the one you want to connect to the calendar)

6. Click **SAVE**

7. Now try connecting again - you should be able to authorize!

## Solution 2: Bypass the Warning (Quick but shows warning)

If you see a screen saying "Google hasn't verified this app":

1. Click **"Advanced"** at the bottom left
2. Click **"Go to [Your App Name] (unsafe)"**
3. Review the permissions
4. Click **"Continue"**

This will work but will show a warning each time until the app is verified.

## Solution 3: Publish the App (For Production)

If you want to remove the warning permanently:

1. Go to [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
2. Click **"PUBLISH APP"**
3. Confirm the action

**Note:** Publishing doesn't require full Google verification if you're only requesting sensitive scopes (like calendar.readonly). The app will work for anyone but may show a warning.

## Solution 4: Submit for Verification (For Public Apps)

Only needed if you plan to share this publicly:

1. Complete all required fields in OAuth consent screen
2. Add privacy policy and terms of service URLs
3. Submit for Google verification
4. Wait for approval (can take several days)

## For Your Personal Dashboard:

**Just add yourself as a test user (Solution 1)** - this is the easiest and most appropriate solution for personal use.

After adding yourself as a test user:
- No warnings will appear
- Only you (and other test users) can connect
- Perfect for personal dashboards
- No verification needed
