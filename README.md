# Pax Code

<p align="center">
  <img src="media/icon.png" alt="Pax Code Logo" width="128" height="128">
</p>

<p align="center">
  <strong>A beautiful dark theme and keyboard shortcuts reference panel for VS Code</strong>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=sanglq.pax-code">
    <img src="https://img.shields.io/visual-studio-marketplace/v/sanglq.pax-code?style=flat-square&label=VS%20Marketplace" alt="VS Marketplace Version">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=sanglq.pax-code">
    <img src="https://img.shields.io/visual-studio-marketplace/i/sanglq.pax-code?style=flat-square" alt="Installs">
  </a>
  <a href="https://github.com/sanglq/pax-code/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/sanglq/pax-code?style=flat-square" alt="License">
  </a>
</p>

---

## ✨ Features

### 🎨 Dark Themes

Pax Code comes with two carefully crafted dark themes:

- **Night Theme** - A comfortable dark theme with balanced contrast
- **Night Theme Vivid** - A more vibrant version with enhanced colors

Both themes feature:

- Semantic highlighting support
- Optimized syntax colors for multiple languages
- Easy on the eyes for long coding sessions

### ⌨️ Hotkeys Reference Panel

Never forget your keyboard shortcuts again! Pax Code adds a **Hotkeys** panel to your Activity Bar that displays an organized list of useful keyboard shortcuts.

- 📁 **Grouped by Category** - Font/Zoom, Editor Tabs, Explorer, Terminal, Selection/Editing
- 🔍 **Quick Reference** - See hotkey combinations at a glance
- ⚡ **Auto-load** - Hotkeys are automatically loaded when VS Code starts

## 📦 Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`)
3. Search for "Pax Code"
4. Click **Install**

### From VSIX File

```bash
code --install-extension pax-code-x.x.x.vsix
```

## 🚀 Usage

### Activating the Theme

1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Type "Color Theme"
3. Select **Preferences: Color Theme**
4. Choose **Night Theme** or **Night Theme Vivid**

### Using Hotkeys Panel

1. Click on the **Hotkeys** icon in the Activity Bar (left sidebar)
2. Expand categories to see available shortcuts

## 📋 Hotkey Categories

| Category                 | Description                       |
| ------------------------ | --------------------------------- |
| **Font / Zoom**          | Zoom in/out, font size controls   |
| **Editor Tabs & Groups** | Tab navigation, split editors     |
| **Explorer / Sidebar**   | File navigation, sidebar controls |
| **Terminal**             | Terminal focus and management     |
| **Selection / Editing**  | Column selection, line operations |

## ⚙️ Configuration

### Custom Hotkeys

You can customize the hotkeys displayed in the panel by modifying the `hotkeys.json` file in the extension directory.

Each hotkey entry supports:

```json
{
  "group": "Category Name",
  "label": "Action Description",
  "key": "cmd+shift+p",
  "command": "workbench.action.showCommands"
}
```

## 🛠️ Development

### Prerequisites

- Node.js 20+
- Yarn or npm

### Setup

```bash
# Clone the repository
git clone https://github.com/sanglq/pax-code.git
cd pax-code

# Install dependencies
yarn install

# Compile
yarn compile

# Watch mode
yarn watch
```

### Building VSIX

```bash
# Package the extension
yarn package
npx vsce package
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/sanglq">sanglq</a>
</p>
