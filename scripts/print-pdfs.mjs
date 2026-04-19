/**
 * Generates print-ready PDFs for every reference page in ChemHelper.
 * Run from the project root: node scripts/print-pdfs.mjs
 *
 * Requires puppeteer accessible via NODE_PATH (uses the npx-cached install).
 * Starts the Vite dev server automatically.
 */

// Resolve puppeteer from the npx cache (not installed as a project dep)
const PUPPETEER_PATH = '/Users/christopherwood/.npm/_npx/7d92d9a2d2ccc630/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js'
const { default: puppeteer } = await import(PUPPETEER_PATH)
import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.join(__dirname, '..')
const OUT_DIR = path.join(PROJECT_ROOT, 'docs', 'pdfs')
const BASE_URL = 'http://localhost:5173'
const PDF_OPTS = {
  format: 'Letter',
  printBackground: true,
  margin: { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' },
}

fs.mkdirSync(OUT_DIR, { recursive: true })

/**
 * Each entry:
 *   url       – path + query string
 *   filename  – output filename in docs/pdfs/
 *   printAll  – if true, clicks the "Print All" button before generating
 */
const PAGES = [
  // ── Print All pages (one PDF covers all topics) ──────────────────────────
  { url: '/stoichiometry?tab=ref-stoich',  filename: 'stoichiometry-reference.pdf',  printAll: true },
  { url: '/redox?tab=ref-oxidation',       filename: 'redox-reference.pdf',           printAll: true },
  { url: '/calculations?tab=ref-moles',    filename: 'calculations-reference.pdf',    printAll: true },

  // ── Thermochemistry (one PDF per section) ────────────────────────────────
  { url: '/thermochemistry?tab=calorimetry-reference',    filename: 'thermo-calorimetry.pdf' },
  { url: '/thermochemistry?tab=enthalpy-reference',       filename: 'thermo-enthalpy.pdf' },
  { url: '/thermochemistry?tab=hess-reference',           filename: 'thermo-hess.pdf' },
  { url: '/thermochemistry?tab=bond-reference',           filename: 'thermo-bond-enthalpy.pdf' },
  { url: '/thermochemistry?tab=heattransfer-reference',   filename: 'thermo-heat-transfer.pdf' },
  { url: '/thermochemistry?tab=heating-curve-reference',  filename: 'thermo-heating-curve.pdf' },
  { url: '/thermochemistry?tab=phase-diagram-reference',  filename: 'thermo-phase-diagram.pdf' },
  { url: '/thermochemistry?tab=cc-reference',             filename: 'thermo-clausius-clapeyron.pdf' },

  // ── Ideal Gas ────────────────────────────────────────────────────────────
  { url: '/ideal-gas?tab=ref-pvnrt', filename: 'ideal-gas-reference.pdf' },

  // ── Structures (one PDF per reference tab) ───────────────────────────────
  { url: '/structures?tab=lewis',       filename: 'structures-lewis.pdf' },
  { url: '/structures?tab=vsepr',       filename: 'structures-vsepr.pdf' },
  { url: '/structures?tab=solid-types', filename: 'structures-solid-types.pdf' },
  { url: '/structures?tab=unit-cell',   filename: 'structures-unit-cell.pdf' },

  // ── Reference page quick sheets ──────────────────────────────────────────
  { url: '/reference?tab=stoich',      filename: 'reference-stoichiometry.pdf' },
  { url: '/reference?tab=molar',       filename: 'reference-molar.pdf' },
  { url: '/reference?tab=solubility',  filename: 'reference-solubility.pdf' },
  { url: '/reference?tab=quantum',     filename: 'reference-quantum.pdf' },
  { url: '/reference?tab=energy',      filename: 'reference-energy.pdf' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

async function waitForServer(url, maxMs = 60_000) {
  const deadline = Date.now() + maxMs
  while (Date.now() < deadline) {
    try {
      const r = await fetch(url)
      if (r.ok) return
    } catch { /* not ready yet */ }
    await sleep(500)
  }
  throw new Error(`Server at ${url} did not become ready within ${maxMs / 1000}s`)
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function clickPrintAll(page) {
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent?.includes('Print All'))
    if (!btn) throw new Error('Print All button not found')
    btn.click()
  })
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Start Vite dev server
  process.stdout.write('Starting dev server… ')
  const server = spawn('npm', ['run', 'dev'], {
    cwd: PROJECT_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  server.stdout.on('data', () => {}) // drain
  server.stderr.on('data', () => {})

  try {
    await waitForServer(BASE_URL)
    console.log('ready.\n')

    const browser = await puppeteer.launch({ headless: true })

    try {
      for (const { url, filename, printAll } of PAGES) {
        process.stdout.write(`  ${filename} … `)

        const page = await browser.newPage()

        // Suppress the browser's own print dialog
        await page.evaluateOnNewDocument(() => { window.print = () => {} })
        await page.setViewport({ width: 1440, height: 900 })

        await page.goto(BASE_URL + url, { waitUntil: 'networkidle0', timeout: 30_000 })

        // Let Framer Motion animations finish
        await sleep(600)

        if (printAll) {
          await clickPrintAll(page)
          // Wait for React to re-render with printingAll=true
          await sleep(800)
        }

        await page.pdf({ path: path.join(OUT_DIR, filename), ...PDF_OPTS })
        await page.close()

        console.log('done')
      }
    } finally {
      await browser.close()
    }

    console.log(`\nAll ${PAGES.length} PDFs saved to docs/pdfs/`)
  } finally {
    server.kill()
  }
}

main().catch(err => { console.error('\n', err); process.exit(1) })
