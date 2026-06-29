# html2pdf

Convert any HTML file to a PDF using headless Chrome (Puppeteer).

- Correct relative image paths — images resolve from the HTML file's directory
- Optional header (document title) and footer (page N of M · filename · date)
- Configurable page format and margins
- Auto-installs Puppeteer on first run
- Works on Windows, Mac, and Linux

---

## Quick start

### Option 1 — Global install (recommended)

```bash
cd html2pdf
npm install -g .
html2pdf report.html
```

### Option 2 — Bash launcher (no install)

```bash
bash run.sh report.html -o output.pdf
```

### Option 3 — PowerShell launcher (Windows)

```powershell
.\run.ps1 report.html -o output.pdf
```

---

## Usage

```
html2pdf <input.html> [options]
```

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--output <path>` | `-o` | same dir/name as input, `.pdf` | Output PDF path |
| `--format <fmt>` | `-f` | `A4` | Page format: `A4` · `A3` · `Letter` |
| `--margin <preset>` | `-m` | `normal` | Margin preset: `normal` · `compact` · `none` |
| `--no-header` | | _(header on)_ | Suppress header and footer |
| `--wait <ms>` | | `1500` | Extra settle time in ms before capture |
| `--help` | `-h` | | Show help |

---

## Examples

```bash
# Basic — outputs report.pdf next to report.html
html2pdf report.html

# Custom output path
html2pdf report.html -o out/report.pdf

# A3 page, compact margins
html2pdf report.html -o out/report.pdf -f A3 -m compact

# No header/footer, extra wait for slow animations
html2pdf report.html --no-header --wait 3000

# Full set of options
html2pdf report.html -o out/report.pdf -f Letter -m none --no-header --wait 500
```

---

## Margin presets

| Preset | Top/Right/Left | Bottom |
|--------|---------------|--------|
| `normal` | 15 mm | 20 mm |
| `compact` | 8 mm | 12 mm |
| `none` | 0 | 0 |

---

## Puppeteer configuration

| Setting | Value |
|---------|-------|
| Headless mode | `new` |
| Background printing | enabled |
| Page load wait | `networkidle0` |
| Image wait | all `<img>` elements polled until `.complete` |
| Chrome flags | `--no-sandbox` `--disable-setuid-sandbox` `--disable-dev-shm-usage` |

---

## Project structure

```
html2pdf/
  index.js      CLI entry point — argument parsing, validation, orchestration
  convert.js    Core Puppeteer logic — exported as async convert(opts)
  run.sh        Bash launcher (Mac / Linux / Git Bash)
  run.ps1       PowerShell launcher (Windows)
  package.json  Package manifest with bin entry
  .gitignore
  README.md
```

---

## Requirements

- Node.js 18+
- npm (for dependency installation)
- Internet access on first run (to download Puppeteer / Chromium)
