const path = require('path');
const { execSync } = require('child_process');

const MARGIN_PRESETS = {
  normal:  { top: '15mm', right: '15mm', bottom: '20mm', left: '15mm' },
  compact: { top: '8mm',  right: '8mm',  bottom: '12mm', left: '8mm'  },
  none:    { top: '0',    right: '0',    bottom: '0',    left: '0'    },
};

function ensurePuppeteer() {
  try {
    require.resolve('puppeteer');
  } catch {
    console.log('[puppdf] puppeteer not found — installing...');
    execSync('npm install puppeteer', {
      cwd: path.join(__dirname),
      stdio: 'inherit',
    });
  }
}

/**
 * @param {object} opts
 * @param {string} opts.input     Absolute path to HTML file
 * @param {string} opts.output    Absolute path for output PDF
 * @param {string} [opts.format]  Page format: A4 | A3 | Letter
 * @param {string} [opts.margin]  Margin preset: normal | compact | none
 * @param {boolean} [opts.header] Include header/footer (default true)
 * @param {number} [opts.wait]    Extra settle time in ms (default 1500)
 */
async function convert(opts) {
  ensurePuppeteer();

  const puppeteer = require('puppeteer');
  const fs = require('fs');

  const {
    input,
    output,
    format = 'A4',
    margin = 'normal',
    header = true,
    wait = 1500,
  } = opts;

  if (!fs.existsSync(input)) {
    throw new Error(`Input file not found: ${input}`);
  }

  const inputDir = path.dirname(input);
  const inputBase = path.basename(input);
  const fileUrl = 'file:///' + input.replace(/\\/g, '/');

  const marginValues = MARGIN_PRESETS[margin] || MARGIN_PRESETS.normal;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  try {
    const page = await browser.newPage();

    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    // Wait for all images to finish loading
    await page.evaluate(() =>
      Promise.all(
        Array.from(document.images).map(img =>
          img.complete
            ? Promise.resolve()
            : new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
              })
        )
      )
    );

    if (wait > 0) {
      await new Promise(resolve => setTimeout(resolve, wait));
    }

    const docTitle = await page.title();
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });

    const headerTemplate = header
      ? `<div style="
            font-family: Arial, sans-serif;
            font-size: 9px;
            color: #555;
            width: 100%;
            text-align: center;
            padding: 4px 15mm;
            border-bottom: 1px solid #ddd;
          ">
            ${escapeHtml(docTitle || inputBase)}
          </div>`
      : '<span></span>';

    const footerTemplate = header
      ? `<div style="
            font-family: Arial, sans-serif;
            font-size: 9px;
            color: #555;
            width: 100%;
            text-align: center;
            padding: 4px 15mm;
            border-top: 1px solid #ddd;
          ">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
            &nbsp;·&nbsp; ${escapeHtml(inputBase)}
            &nbsp;·&nbsp; ${escapeHtml(dateStr)}
          </div>`
      : '<span></span>';

    await page.pdf({
      path: output,
      format,
      printBackground: true,
      margin: marginValues,
      displayHeaderFooter: header,
      headerTemplate,
      footerTemplate,
    });

    console.log(`[puppdf] PDF saved to: ${output}`);
  } finally {
    await browser.close();
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { convert };
