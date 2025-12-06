# Chromebook Dashboard Setup Instructions

## One-Time Setup (After Linux Installation Completes)

### Step 1: Copy Setup Files to Chromebook

On your **Chromebook Terminal**, run:

```bash
# Create a folder for the dashboard
mkdir -p ~/dashboard
cd ~/dashboard

# Download the setup scripts from your desktop
scp charles@192.168.1.164:/home/charles/Code/dashmaster/dashmaster-ui/chromebook-setup.sh .
scp charles@192.168.1.164:/home/charles/Code/dashmaster/dashmaster-ui/start-dashboard.sh .
scp charles@192.168.1.164:/home/charles/Code/dashmaster/dashmaster-ui/stop-dashboard.sh .

# Make them executable
chmod +x *.sh
```

When prompted, enter password: `Freegums9`

### Step 2: Run Setup Script (One-Time Only)

```bash
./chromebook-setup.sh
```

This will:
- Install required packages
- Generate an SSH key
- Copy the key to your desktop (no more password needed!)

You'll need to enter your desktop password ONE LAST TIME during this step.

---

## Daily Use (Super Easy!)

### To Start the Dashboard:

```bash
cd ~/dashboard
./start-dashboard.sh
```

This will:
- Start the SSH tunnel automatically
- Open Chrome to http://localhost:5000
- Dashboard is ready to use with camera support!

### To Stop the Dashboard:

```bash
cd ~/dashboard
./stop-dashboard.sh
```

---

## Optional: Create Desktop Shortcut

To make it even easier, create a desktop shortcut:

```bash
cat > ~/Desktop/Dashboard.desktop << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Dashboard
Comment=Open Dashboard with Camera Support
Exec=/bin/bash -c "cd ~/dashboard && ./start-dashboard.sh"
Icon=utilities-terminal
Terminal=true
Categories=Utility;
EOF

chmod +x ~/Desktop/Dashboard.desktop
```

Now you can just **double-click "Dashboard" on your desktop** to launch!

---

## Troubleshooting

### If the tunnel fails to start:
1. Make sure your desktop is powered on
2. Check that both devices are on the same network
3. Verify desktop IP is still 192.168.1.164:
   ```bash
   ping 192.168.1.164
   ```

### If you get "permission denied":
Run the setup script again:
```bash
./chromebook-setup.sh
```

### To check if tunnel is running:
```bash
pgrep -f "ssh.*5000:localhost:5000"
```
If you see a number, the tunnel is running.
