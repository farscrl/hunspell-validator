# Hunspell Validator

A web-based spell checker validator for Hunspell dictionaries and affix rules. Test and validate Hunspell dictionary files (.dic) and affix rule files (.aff) with real-time spell checking. Currently supports multiple languages via the Pledari Grond API, with plans to integrate additional language package sources.

**Live App**: https://farscrl.github.io/hunspell-validator/

## Features

- **Three-Column Editor Layout**
  - Left: Affix rules (.aff) editor - view and edit Hunspell affix rules
  - Center: Dictionary (.dic) editor - view and edit Hunspell dictionary entries
  - Right: Rich text editor with integrated spell checking

- **Language Presets**
  - One-click language loading from configurable sources
  - Currently supports multiple language variants via Pledari Grond API
  - Extensible architecture for adding additional language package sources

- **Real-Time Spell Checking**
  - Live spell checking with red underlines for misspelled words
  - Smart suggestions popup on misspelled words
  - Automatic spell checker rebuild when rules or dictionary change (with debouncing)
  - Loading indicator during spell checker initialization

- No server-side spell checking - all processing happens in the browser

## Technology Stack

- **Frontend Framework**: Angular 20 (standalone components)
- **Text Editors**:
  - Monaco Editor (ngx-monaco-editor-v2) for rules and dictionary
  - Tiptap Editor for rich text with spell checking
- **Spell Checking**:
  - hunspell-asm (WebAssembly-based Hunspell)
  - @farscrl/tiptap-extension-spellchecker
- **Styling**: Tailwind CSS v4
- **Package Manager**: pnpm
- **CI/CD**: GitHub Actions with deployment to GitHub Pages

## Getting Started

### Prerequisites

- Node.js 22 or higher
- pnpm 10 or higher

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hunspell-validator
```

2. Install dependencies:
```bash
pnpm install
```

### Development Server

Start the development server:
```bash
pnpm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you modify source files.

### Building

Build the project for production:
```bash
pnpm run build
```

The build artifacts will be stored in the `dist/` directory.

## How It Works

1. **Load a Language**: Click "Load Language Preset" and select a language to load pre-configured dictionary and affix files.

2. **Edit Rules and Dictionary**:
   - Modify the .aff file (left) to change spelling rules
   - Modify the .dic file (center) to change dictionary entries
   - Changes are automatically debounced and trigger spell checker rebuild

3. **Spell Check**: Type or paste text in the right editor to see real-time spell checking results. Words not found in the dictionary will be underlined in red.

4. **Get Suggestions**: Click on misspelled words to see suggestions from the spell checker.

## Language Package Sources

### Current Source: Pledari Grond

The application currently loads language files from the **Pledari Grond** spell checker API. The architecture is designed to be extensible for adding additional language package sources in the future.


## Deployment

The project is automatically deployed to GitHub Pages when you push to the `main` branch. The deployment is handled by GitHub Actions (see `.github/workflows/deploy.yml`).

The application is available at:
```
https://farscrl.github.io/hunspell-validator/
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Modern browsers with WebAssembly support are required.

## Acknowledgments

- Built with [Angular](https://angular.io)
- Spell checking via [Hunspell](https://hunspell.github.io/) and [hunspell-asm](https://github.com/farscrl/hunspell-asm)
- Editor components from [Monaco Editor](https://microsoft.github.io/monaco-editor/) and [Tiptap](https://tiptap.dev)
- Language data from [Pledari Grond](https://www.pledarigrond.ch/)
- Styling with [Tailwind CSS](https://tailwindcss.com)
