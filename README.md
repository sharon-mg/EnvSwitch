# <img src="icons/icon48.png" width="32" height="32" alt="SwitchEnv icon"> SwitchEnv

A Chrome extension for developers to quickly switch between different environments (dev, staging, production, etc.) by changing URL subdomains, with optional visual markers to identify the current environment.

## Features

- **Quick Environment Switching** - Switch between environments with a single click from the popup menu
- **Visual Page Markers** - Display a ribbon, badge, or triangle indicator showing which environment you're on
- **Custom Colors** - Assign unique colors to each environment for easy identification
- **Configurable Position** - Place the marker in the top-left or top-right corner
- **Hover Transparency** - Marker fades when hovered, allowing interaction with elements underneath
- **Real-time Updates** - Markers update instantly when you change settings

## Installation

1. **Download the extension**
   - Clone this repository or download as ZIP and extract

   ```bash
   git clone https://github.com/YOUR_USERNAME/EnvSwitch.git
   ```

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions` in your browser

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `EnvSwitch` folder containing `manifest.json`

5. **Pin the Extension** (optional)
   - Click the puzzle piece icon in Chrome toolbar
   - Pin SwitchEnv for quick access

## Usage

### Adding Environments

1. Right-click the extension icon → **Options** (or click the gear icon)
2. In the **Environments** section:
   - Enter the environment name (e.g., "Dev", "Staging", "Prod")
   - Enter the subdomain (e.g., "dev", "staging", "app")
   - Pick a color for the marker
   - Click **Add**

### Switching Environments

1. Click the SwitchEnv icon in your toolbar
2. Click the button for the environment you want
3. The page will reload with the new subdomain

### Configuring Page Markers

1. Open extension **Options**
2. In the **Page Marker** section:
   - **Show Marker** - Toggle markers on/off
   - **Hover Opacity** - Set how transparent the marker becomes when hovered (0-100%)
   - **Shape** - Choose ribbon, badge, or triangle
   - **Position** - Top-left or top-right corner

## How It Works

The extension replaces the subdomain of your current URL with the subdomain of your selected environment. For example:

```
https://dev.example.com/dashboard
       ↓ Switch to "Staging"
https://staging.example.com/dashboard
```

## Permissions

- `storage` - Save your environment configurations
- `activeTab` - Access the current tab's URL
- `scripting` - Inject the visual marker into pages

## License

MIT
