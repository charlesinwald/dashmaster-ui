# Google Calendar Integration Setup Guide

This guide will help you set up Google Calendar integration for your DashMaster dashboard.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "DashMaster")
5. Click "Create"

## Step 2: Enable Google Calendar API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on it and click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External (unless you have a Google Workspace)
   - App name: DashMaster
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add `../auth/calendar.readonly`
   - Test users: Add your Google account email
4. Back to Create OAuth client ID:
   - Application type: Web application
   - Name: DashMaster Web Client
   - Authorized redirect URIs: Add the following (based on your setup):
     - `http://localhost:3001/api/calendar/oauth2callback` (for local development)
     - `http://192.168.1.164:3001/api/calendar/oauth2callback` (for your network IP)
     - Add any other URLs you'll use to access the dashboard
5. Click "Create"
6. Copy the Client ID and Client Secret

## Step 4: Configure Environment Variables

1. Open your `.env` file in the dashmaster-ui directory
2. Update the following variables with your credentials:

```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://192.168.1.164:3001/api/calendar/oauth2callback
```

**Important:** Make sure the `GOOGLE_REDIRECT_URI` matches one of the authorized redirect URIs you configured in Google Cloud Console.

## Step 5: Restart the Server

After updating the `.env` file, restart your Express server:

```bash
yarn dev:server
# or
npm run dev:server
```

## Step 6: Connect Google Calendar

1. Open your DashMaster dashboard
2. Find the Calendar widget
3. Click the "Connect Google" button
4. A popup window will open asking you to authorize the application
5. Sign in with your Google account
6. Grant the requested permissions (read-only access to your calendar)
7. The popup will close automatically after successful authorization
8. Your upcoming events will now appear in the Calendar widget!

## Features

- **View Upcoming Events**: See your next events from Google Calendar
- **Automatic Sync**: Events are refreshed when you connect
- **Privacy-Focused**: Read-only access - the app cannot modify your calendar
- **Easy Disconnect**: Click the disconnect icon to revoke access anytime

## Troubleshooting

### "Google Calendar OAuth not configured" error
- Make sure you've added the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to your `.env` file
- Restart the server after updating the `.env` file

### OAuth popup is blocked
- Allow popups for your dashboard domain in your browser settings

### "Redirect URI mismatch" error
- Ensure the `GOOGLE_REDIRECT_URI` in `.env` exactly matches one of the authorized redirect URIs in Google Cloud Console
- Make sure you're accessing the dashboard using the same URL (localhost vs IP address)

### Events not showing up
- Check that you have upcoming events in your Google Calendar (within the next 7 days)
- Click the cloud icon to toggle the events view
- Check the browser console for any error messages

## Security Notes

- Your OAuth tokens are stored locally in `data/google-token.json`
- The app only requests read-only access to your calendar
- You can revoke access anytime from your [Google Account permissions](https://myaccount.google.com/permissions) or by clicking the disconnect button
- Do not commit the `.env` file or `data/google-token.json` to version control

## Accessing from Multiple Devices

If you want to access the dashboard from multiple devices (desktop, Chromebook, phone), you need to:

1. Add all possible access URLs as authorized redirect URIs in Google Cloud Console
2. Update the `GOOGLE_REDIRECT_URI` in `.env` to match the URL you're primarily using
3. Or use a consistent URL (like your local network IP) across all devices
