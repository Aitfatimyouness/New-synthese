import { chromium } from 'playwright';

const baseUrl = 'http://127.0.0.1:5173';
const apiUrl = 'http://127.0.0.1:8000/api';
const users = [
  ['administrateur', 'admin@ofppt.ma'],
  ['responsable_cdc', 'cdc@ofppt.ma'],
  ['responsable_formation', 'formation@ofppt.ma'],
  ['responsable_dr', 'dr@ofppt.ma'],
  ['formateur_participant', 'participant@ofppt.ma'],
  ['formateur_animateur', 'animateur@ofppt.ma'],
];
const password = 'password123';
const sizes = [
  ['desktop', 1440, 900],
  ['tablet', 820, 1100],
  ['mobile', 390, 844],
];

const problems = [];
const notes = [];

function fail(message) {
  problems.push(message);
  console.error(`FAIL ${message}`);
}

async function login(page, email) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByLabel('Email').fill(email);
  await page.fill('input[type="password"]', password);
  await Promise.all([
    page.waitForResponse((response) => response.url().includes('/api/auth/login')),
    page.getByRole('button', { name: /se connecter/i }).click(),
  ]);
  await page.waitForSelector('.topbar-title', { timeout: 15000 });
}

async function closeModal(page) {
  const close = page.getByRole('button', { name: /fermer/i }).first();
  if (await close.count()) {
    await close.click();
    await page.waitForTimeout(150);
  }
}

async function assertStableLayout(page, label) {
  const result = await page.evaluate(() => {
    const viewportOverflow = document.documentElement.scrollWidth - window.innerWidth;
    const actionOverflow = [...document.querySelectorAll('td.actions')].filter((cell) => {
      const c = cell.getBoundingClientRect();
      return [...cell.querySelectorAll('button,a')].some((item) => {
        const b = item.getBoundingClientRect();
        return b.left < c.left - 1 || b.right > c.right + 1 || b.top < c.top - 1 || b.bottom > c.bottom + 1;
      });
    }).length;
    const badButtons = [...document.querySelectorAll('button,a,.import-pill')].filter((item) => {
      const b = item.getBoundingClientRect();
      const style = getComputedStyle(item);
      return style.visibility !== 'hidden' && style.display !== 'none' && (b.width < 20 || b.height < 20);
    }).length;
    const croppedModal = [...document.querySelectorAll('.modal')].map((modal) => {
      const b = modal.getBoundingClientRect();
      return { width: b.width, height: b.height, right: b.right, bottom: b.bottom };
    }).filter((b) => b.width < 320 || b.height < 180 || b.right > window.innerWidth + 2 || b.bottom > window.innerHeight + 2);
    return {
      viewportOverflow,
      actionOverflow,
      badButtons,
      croppedModal: croppedModal.length,
      croppedModalMetrics: croppedModal,
      nativeRowDetails: document.querySelectorAll('details.row-more').length,
    };
  });

  if (result.viewportOverflow > 3) fail(`${label}: page has horizontal overflow ${result.viewportOverflow}px`);
  if (result.actionOverflow) fail(`${label}: ${result.actionOverflow} table action cells overflow`);
  if (result.badButtons) fail(`${label}: ${result.badButtons} visible buttons/links are too small`);
  if (result.croppedModal) fail(`${label}: modal is cropped or too small ${JSON.stringify(result.croppedModalMetrics)}`);
  if (result.nativeRowDetails) fail(`${label}: native row details popovers still exist`);
}

async function verifyDownloads(page, role) {
  const token = await page.evaluate(() => localStorage.getItem('ofppt_token'));
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
  const navLabels = await page.locator('aside nav button span').allTextContents();
  const canExportFormations = navLabels.includes('Formations') && !['formateur_animateur', 'formateur_participant'].includes(role);
  const canReadCertificates = navLabels.includes('Certificats');
  const canReadReports = navLabels.includes('Rapports');

  if (!canExportFormations && !canReadReports && !canReadCertificates) return;

  if (canExportFormations) {
  const csv = await page.evaluate(async ({ apiUrl, headers }) => {
    const response = await fetch(`${apiUrl}/formations/export/csv`, { headers });
    return { ok: response.ok, type: response.headers.get('content-type'), text: (await response.text()).slice(0, 80) };
  }, { apiUrl, headers });
  if (!csv.ok || !csv.text.includes('Training')) fail(`${role}: CSV export did not return clean structured data`);
  }

  if (canReadCertificates) {
  const cert = await page.evaluate(async ({ apiUrl, headers }) => {
    const list = await fetch(`${apiUrl}/certificates?per_page=1`, { headers }).then((r) => r.json());
    const id = list.data?.[0]?.id;
    if (!id) return { skipped: true };
    const response = await fetch(`${apiUrl}/certificates/${id}/pdf`, { headers });
    const buffer = await response.arrayBuffer();
    const head = String.fromCharCode(...new Uint8Array(buffer).slice(0, 5));
    const text = new TextDecoder('latin1').decode(buffer);
    return { ok: response.ok, head, hasUi: /sidebar|button|modal|scrollbar|window\.print/i.test(text), hasBrand: /OFPPT/.test(text) };
  }, { apiUrl, headers });
  if (!cert.skipped && (!cert.ok || cert.head !== '%PDF-' || cert.hasUi || !cert.hasBrand)) fail(`${role}: certificate PDF is not a clean structured OFPPT PDF`);
  }

  if (canReadReports) {
  const report = await page.evaluate(async ({ apiUrl, headers }) => {
    const response = await fetch(`${apiUrl}/rapports/pdf`, { headers });
    const buffer = await response.arrayBuffer();
    const head = String.fromCharCode(...new Uint8Array(buffer).slice(0, 5));
    const text = new TextDecoder('latin1').decode(buffer);
    return { ok: response.ok, head, hasUi: /sidebar|button|modal|scrollbar|window\.print/i.test(text), hasBrand: /OFPPT/.test(text) };
  }, { apiUrl, headers });
  if (!report.ok || report.head !== '%PDF-' || report.hasUi || !report.hasBrand) fail(`${role}: report PDF is not a clean structured OFPPT PDF`);
  }
}

const browser = await chromium.launch({ headless: true });
for (const [role, email] of users) {
  for (const [sizeName, width, height] of sizes) {
    const context = await browser.newContext({ viewport: { width, height }, acceptDownloads: true });
    const page = await context.newPage();
    const consoleErrors = [];
    const apiErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.url().includes('/api/') && response.status() >= 400) {
        apiErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    await login(page, email);
    await assertStableLayout(page, `${role} dashboard ${sizeName}`);
    await page.screenshot({ path: `verification-${role}-${sizeName}.png`, fullPage: true });

    if (sizeName === 'desktop') {
      const navLabels = await page.locator('aside nav button span').allTextContents();
      notes.push(`${role}: ${navLabels.join(', ')}`);
      for (const label of navLabels) {
        const navButton = page.locator('aside nav').getByRole('button', { name: new RegExp(`^${label}$`, 'i') });
        if (!(await navButton.count())) continue;
        await navButton.click();
        await page.waitForTimeout(600);
        await assertStableLayout(page, `${role} ${label}`);

        const more = page.locator('.row-details-button').first();
        if (await more.count()) {
          await more.click();
          await page.waitForSelector('.row-details-modal', { timeout: 5000 });
          await assertStableLayout(page, `${role} ${label} row details modal`);
          await closeModal(page);
        }

        const detail = page.locator('td.actions button[title="Details"], td.actions button[title="View theme"], td.actions button[title="View report"]').first();
        if (await detail.count()) {
          await detail.click();
          await page.waitForSelector('.modal', { timeout: 7000 });
          const modalText = await page.locator('.modal').first().innerText();
          if (modalText.length < 80) fail(`${role} ${label}: details modal has too little readable content`);
          await assertStableLayout(page, `${role} ${label} details modal`);
          await closeModal(page);
        }
      }
      await verifyDownloads(page, role);
    }

    if (consoleErrors.length) fail(`${role} ${sizeName}: console errors: ${consoleErrors.join(' | ')}`);
    const unexpectedApiErrors = apiErrors.filter((item) => !item.includes('/auth/logout'));
    if (unexpectedApiErrors.length) fail(`${role} ${sizeName}: API errors: ${unexpectedApiErrors.join(' | ')}`);
    await context.close();
  }
}

await browser.close();

console.log(`Verified roles and navigation:\n${notes.join('\n')}`);
if (problems.length) {
  console.error(`\n${problems.length} verification problem(s) found.`);
  process.exit(1);
}
console.log('\nPlatform visual/function verification passed.');
