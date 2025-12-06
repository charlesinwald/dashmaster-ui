# DashMaster UI

A touchscreen-optimized dashboard for controlling your main desktop from a Chromebook. Built with Next.js, Express, and TypeScript.

## Features

- **Clock Widget** - Real-time clock and date display
- **Weather Widget** - Current weather and conditions using WeatherAPI.com
- **System Monitor** - Real-time CPU, memory, and disk usage from your desktop via SSH
- **App Launcher** - Launch applications on your desktop with customizable shortcuts
- **Quick Notes** - Simple note-taking with local JSON storage
- **Calendar & Reminders** - Track events and reminders
- **Drag & Drop Layout** - Fully customizable widget layout with touch support
- **Touch Optimized** - Large buttons and gestures for touchscreen devices

## Tech Stack

- **Frontend**: Next.js 14+, React, TypeScript, Tailwind CSS
- **Backend**: Express, Node.js
- **SSH**: SSH2 for remote command execution
- **Weather**: WeatherAPI.com integration
- **Layout**: React Grid Layout for drag-and-drop
- **Storage**: Local JSON files for notes and calendar data

## Prerequisites

- Node.js 18+ and Yarn
- SSH access to your desktop machine
- WeatherAPI.com API key (free tier available)

## Installation

1. **Clone or navigate to the project:**
   ```bash
   cd dashmaster-ui
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env` and update with your settings:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - `DESKTOP_SSH_HOST` - Your desktop's IP address
   - `DESKTOP_SSH_PORT` - SSH port (default: 22)
   - `DESKTOP_SSH_USER` - Your desktop username
   - `DESKTOP_SSH_PASSWORD` - Your desktop password (or use key-based auth)
   - `WEATHER_API_KEY` - Get your free API key from [WeatherAPI.com](https://www.weatherapi.com/)
   - `WEATHER_LOCATION` - Your city/location
   - `WEATHER_UNITS` - `imperial` or `metric`

4. **For key-based SSH authentication (recommended):**
   - Generate SSH key on Chromebook: `ssh-keygen -t rsa`
   - Copy public key to desktop: `ssh-copy-id user@desktop-ip`
   - Update `.env` with `DESKTOP_SSH_PRIVATE_KEY_PATH=/path/to/private/key`

## Running the Application

### Development Mode

Run both Next.js and Express servers concurrently:

```bash
yarn dev
```

- Next.js frontend: http://localhost:5000
- Express API server: http://localhost:5001

### Production Mode

```bash
yarn build
yarn start
```

## Project Structure

```
dashmaster-ui/
├── app/
│   ├── components/
│   │   ├── Dashboard.tsx          # Main dashboard with grid layout
│   │   └── widgets/               # Individual widget components
│   │       ├── ClockWidget.tsx
│   │       ├── WeatherWidget.tsx
│   │       ├── SystemMonitorWidget.tsx
│   │       ├── AppLauncherWidget.tsx
│   │       ├── NotesWidget.tsx
│   │       └── CalendarWidget.tsx
│   ├── globals.css
│   └── page.tsx
├── server/
│   ├── index.ts                   # Express server entry point
│   ├── routes/                    # API routes
│   │   ├── ssh.ts                 # SSH command execution
│   │   ├── weather.ts             # Weather API
│   │   ├── system.ts              # System monitoring
│   │   └── data.ts                # Notes/calendar/layout data
│   └── services/                  # Business logic
│       ├── sshService.ts          # SSH connection handler
│       ├── weatherService.ts      # Weather API client
│       └── dataService.ts         # JSON file storage
├── data/                          # Auto-created for storing JSON files
│   ├── notes.json
│   ├── calendar.json
│   └── layout.json
├── types/
│   └── index.ts                   # TypeScript type definitions
└── .env                           # Environment configuration
```

## API Endpoints

### SSH Operations
- `POST /api/ssh/launch` - Launch an application
  ```json
  { "command": "firefox &" }
  ```
- `POST /api/ssh/execute` - Execute custom command
  ```json
  { "command": "ls -la" }
  ```

### System Monitoring
- `GET /api/system/info` - Get CPU, memory, disk usage

### Weather
- `GET /api/weather/current` - Get current weather
- `GET /api/weather/forecast?days=3` - Get forecast

### Data Management
- `GET /api/data/notes` - Get all notes
- `POST /api/data/notes` - Create note
- `PUT /api/data/notes/:id` - Update note
- `DELETE /api/data/notes/:id` - Delete note
- `GET /api/data/calendar` - Get calendar events
- `POST /api/data/calendar` - Create event
- `PUT /api/data/calendar/:id` - Update event
- `DELETE /api/data/calendar/:id` - Delete event
- `GET /api/data/layout` - Get saved layout
- `POST /api/data/layout` - Save layout

## Customizing App Shortcuts

The App Launcher widget comes with default apps. To customize:

1. Click the "+" button in the App Launcher widget
2. Enter the app name and command
3. Commands should end with `&` to run in background
4. Examples:
   - Firefox: `firefox &`
   - Chrome: `google-chrome &`
   - VS Code: `code &`
   - Terminal: `gnome-terminal &`
   - Custom script: `/path/to/script.sh &`

## Touch Optimization Features

- Large, touch-friendly buttons (minimum 44x44px)
- Drag handles for repositioning widgets
- Smooth animations and transitions
- No hover-dependent interactions
- Optimized scrolling for touch devices
- Tap highlight removal for native feel

## Troubleshooting

### SSH Connection Issues
- Verify SSH credentials in `.env`
- Test SSH connection: `ssh user@desktop-ip`
- Check firewall settings on desktop
- Enable SSH on desktop: `sudo systemctl enable ssh`

### Weather Not Loading
- Verify `WEATHER_API_KEY` is correct
- Check API key is active at [WeatherAPI.com](https://www.weatherapi.com/)
- Ensure `WEATHER_LOCATION` is valid

### System Monitor Not Working
- Ensure SSH commands work: test with `ssh user@desktop-ip "top -bn1"`
- Commands are Linux-specific; may need adjustment for other OS

### Data Not Persisting
- Check `data/` directory exists and is writable
- Verify API server is running on port 5001
- Check browser console for API errors

## Security Notes

- Store `.env` file securely - never commit to git
- Use SSH key authentication instead of passwords
- Run behind firewall or VPN when accessing over network
- Consider setting up HTTPS for production use
- The dashboard has no authentication - ensure network security

## Development

### Run frontend only:
```bash
yarn dev:next
```

### Run backend only:
```bash
yarn dev:server
```

### Lint:
```bash
yarn lint
```

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
