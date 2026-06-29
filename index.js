#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs');

// --- Minimal arg parser (avoids requiring minimist before npm install) -------

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = {
    _: [],
    output: null,
    format: 'A4',
    margin: 'normal',
    header: true,
    wait: 1500,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--help' || a === '-h') {
      result.help = true;
    } else if (a === '--no-header') {
      result.header = false;
    } else if ((a === '--output' || a === '-o') && args[i + 1]) {
      result.output = args[++i];
    } else if ((a === '--format' || a === '-f') && args[i + 1]) {
      result.format = args[++i];
    } else if ((a === '--margin' || a === '-m') && args[i + 1]) {
      result.margin = args[++i];
    } else if (a === '--wait' && args[i + 1]) {
      result.wait = parseInt(args[++i], 10) || 0;
    } else if (!a.startsWith('-')) {
      result._.push(a);
    }
  }

  return result;
}

function printHelp() {
  console.log(`
html2pdf — Convert an HTML file to PDF using headless Chrome

Usage:
  html2pdf <input.html> [options]

Options:
  -o, --output <path>    Output PDF path (default: same dir/name as input, .pdf)
  -f, --format <fmt>     Page format: A4 (default) | A3 | Letter
  -m, --margin <preset>  Margin preset: normal (default) | compact | none
      --no-header        Suppress header and footer
      --wait <ms>        Extra settle time before capture (default: 1500)
  -h, --help             Show this help

Examples:
  html2pdf report.html
  html2pdf report.html -o out/report.pdf
  html2pdf report.html -o out/report.pdf -f A3 -m compact
  html2pdf report.html --no-header --wait 3000
`);
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (args._.length === 0) {
    console.error('[html2pdf] Error: no input file specified.\n');
    printHelp();
    process.exit(1);
  }

  const VALID_FORMATS = ['A4', 'A3', 'Letter'];
  const VALID_MARGINS = ['normal', 'compact', 'none'];

  if (!VALID_FORMATS.includes(args.format)) {
    console.error(`[html2pdf] Invalid --format "${args.format}". Choose from: ${VALID_FORMATS.join(', ')}`);
    process.exit(1);
  }
  if (!VALID_MARGINS.includes(args.margin)) {
    console.error(`[html2pdf] Invalid --margin "${args.margin}". Choose from: ${VALID_MARGINS.join(', ')}`);
    process.exit(1);
  }

  const inputRaw = args._[0];
  const inputAbs = path.resolve(process.cwd(), inputRaw);

  if (!fs.existsSync(inputAbs)) {
    console.error(`[html2pdf] Input file not found: ${inputAbs}`);
    process.exit(1);
  }

  let outputAbs;
  if (args.output) {
    outputAbs = path.resolve(process.cwd(), args.output);
    // Create output directory if needed
    const outDir = path.dirname(outputAbs);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
  } else {
    const ext = path.extname(inputAbs);
    outputAbs = inputAbs.slice(0, inputAbs.length - ext.length) + '.pdf';
  }

  const { convert } = require('./convert');

  try {
    await convert({
      input: inputAbs,
      output: outputAbs,
      format: args.format,
      margin: args.margin,
      header: args.header,
      wait: args.wait,
    });
  } catch (err) {
    console.error(`[html2pdf] Error: ${err.message}`);
    process.exit(1);
  }
}

main();
