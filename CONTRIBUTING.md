# Contributing to Pax Code

Thank you for your interest in contributing to Pax Code! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- Yarn package manager
- VS Code (for testing)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/sanglq/pax-code.git
   cd pax-code
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Build the extension**
   ```bash
   yarn compile
   ```

4. **Watch mode (for development)**
   ```bash
   yarn watch
   ```

### Running the Extension

1. Open the project in VS Code
2. Press `F5` to open a new Extension Development Host window
3. The extension will be loaded in the new window

## Project Structure

```
pax-code/
├── src/
│   └── extension.ts      # Main extension code
├── themes/
│   ├── Night Theme-color-theme.json
│   ├── Night Theme Vidid-color-theme.json
│   ├── token.json        # Base token colors
│   └── token-vivid.json  # Vivid token colors
├── media/
│   └── symbol-keyword.svg  # Activity bar icon
├── hotkeys.json          # Hotkey definitions
├── package.json          # Extension manifest
└── esbuild.js           # Build configuration
```

## Making Changes

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules (run `yarn lint`)
- Use meaningful variable names
- Add comments for complex logic

### Theme Changes

1. Edit the appropriate theme file in `themes/`
2. Test the changes in VS Code
3. Ensure colors work well with various languages

### Adding Hotkeys

Edit `hotkeys.json` with the following structure:

```json
{
  "group": "Category Name",
  "label": "Action Description",
  "key": "cmd+shift+p",
  "command": "workbench.action.showCommands"
}
```

## Testing

```bash
# Type check
yarn check-types

# Lint
yarn lint

# Full build
yarn compile
```

## Submitting Changes

1. Create a new branch for your feature/fix
2. Make your changes
3. Run tests and linting
4. Commit with a descriptive message
5. Push and create a Pull Request

### Commit Message Guidelines

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Keep the first line under 72 characters

Examples:
- `feat: Add new hotkey category for git commands`
- `fix: Correct color contrast for comments`
- `docs: Update README with installation instructions`

## Creating a Release

Releases are automated via GitHub Actions when a tag is pushed:

```bash
# Update version in package.json
# Update CHANGELOG.md

git add .
git commit -m "chore: bump version to x.x.x"
git tag vx.x.x
git push origin main --tags
```

## Icon Generation

The extension icon (`media/icon.png`) should be:
- 128x128 pixels
- PNG format
- Transparent or dark background

You can convert the SVG to PNG using:
```bash
# Using Inkscape
inkscape -w 128 -h 128 media/icon.svg -o media/icon.png

# Using ImageMagick
convert -background none -resize 128x128 media/icon.svg media/icon.png
```

## Questions?

Feel free to open an issue if you have any questions or need help getting started.

