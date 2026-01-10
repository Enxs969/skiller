# Contributing to Skiller

First off, thank you for considering contributing to Skiller! It's people like you that make Skiller such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title** for the issue
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and what you expected to see
- **Include screenshots** if applicable
- **Include your environment details**:
  - OS and version
  - Skiller version
  - Node.js version
  - Rust version

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any alternative solutions** you've considered

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** and ensure:
   - The code compiles without errors
   - The code follows the existing style
   - You've added tests if applicable
4. **Test your changes**: `npm run tauri dev`
5. **Commit your changes** using [conventional commits](https://www.conventionalcommits.org/):
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks
6. **Push to your fork** and submit a pull request

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 18.x or later
- [Rust](https://www.rust-lang.org/tools/install) 1.70 or later
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/skiller.git
cd skiller

# Install dependencies
npm install

# Run in development mode
npm run tauri dev
```

### Project Structure

```
skiller/
├── src/                      # React frontend
│   ├── components/           # UI components
│   ├── hooks/                # React hooks
│   ├── api/                  # API & caching layer
│   ├── types/                # TypeScript definitions
│   └── styles/               # CSS styles
├── src-tauri/                # Rust backend
│   ├── src/
│   │   ├── lib.rs            # Main entry & tray logic
│   │   └── commands.rs       # Tauri commands
│   └── tauri.conf.json       # Tauri configuration
└── package.json
```

### Code Style

#### TypeScript/React
- Use functional components with hooks
- Follow existing naming conventions
- Use TypeScript strict mode
- Keep components focused and small

#### Rust
- Follow standard Rust conventions
- Use `rustfmt` for formatting
- Handle errors properly with `Result`

### Testing

```bash
# Run frontend type checking
npm run build

# Run the app in development mode
npm run tauri dev
```

## Questions?

Feel free to open an issue with your question or reach out through [GitHub Discussions](https://github.com/skiller-dev/skiller/discussions).

Thank you for contributing! 🎉
