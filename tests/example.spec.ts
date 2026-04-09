import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

// ─── Navigation ───────────────────────────────────────────────────────────────

test('homepage loads with correct title', async ({ page }) => {
  await page.goto(BASE);
  await expect(page).toHaveTitle(/RecruitFlow/);
});

test('Rank tab is visible and active by default', async ({ page }) => {
  await page.goto(BASE);
  await expect(page.getByRole('button', { name: 'Rank', exact: true }).first()).toBeVisible();
});

test('can navigate to History tab', async ({ page }) => {
  await page.goto(BASE);
  await page.getByRole('button', { name: 'History' }).click();
  await expect(page.locator('#tab-history')).toBeVisible();
});

test('can navigate to Analytics tab', async ({ page }) => {
  await page.goto(BASE);
  await page.getByRole('button', { name: 'Analytics' }).click();
  await expect(page.locator('#tab-analytics')).toBeVisible();
});

// ─── Form Validation ──────────────────────────────────────────────────────────

test('shows alert when job description is too short', async ({ page }) => {
  await page.goto(BASE);

  let dialogMessage = '';
  page.once('dialog', async dialog => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });

  await page.locator('#rank-btn').click();
  expect(dialogMessage).toContain('job description');
});

test('shows alert when no resumes are provided', async ({ page }) => {
  await page.goto(BASE);

  await page.locator('#job-description').fill(
    'We need a senior developer with 5+ years of experience in React and Node.js.'
  );

  let dialogMessage = '';
  page.once('dialog', async dialog => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });

  await page.locator('#rank-btn').click();
  expect(dialogMessage).toContain('resume');
});

// ─── Example Data ─────────────────────────────────────────────────────────────

test('Load Example Job fills job title and description', async ({ page }) => {
  await page.goto(BASE);
  await page.locator('#example-job-btn').click();
  await expect(page.locator('#job-title')).toHaveValue('Senior Full Stack Developer');
  await expect(page.locator('#job-description')).not.toHaveValue('');
});

test('Load Example Resumes fills 3 paste areas', async ({ page }) => {
  await page.goto(BASE);
  await page.locator('#example-resumes-btn').click();
  await expect(page.locator('#paste-1')).not.toHaveValue('');
  await expect(page.locator('.paste-textarea')).toHaveCount(3);
});

// ─── Add Another Resume ───────────────────────────────────────────────────────

test('clicking Add Another Resume adds a new paste area', async ({ page }) => {
  await page.goto(BASE);
  await expect(page.locator('.paste-textarea')).toHaveCount(1);
  await page.locator('#add-paste-btn').click();
  await expect(page.locator('.paste-textarea')).toHaveCount(2);
});

// ─── History Tab ──────────────────────────────────────────────────────────────

test('History tab loads and shows sessions or empty state', async ({ page }) => {
  await page.goto(BASE);
  await page.getByRole('button', { name: 'History' }).click();

  // Wait for either session cards or the empty state (API response received)
  await expect(
    page.locator('.session-card, .empty-state').first()
  ).toBeVisible({ timeout: 10000 });
});

// ─── Analytics Tab ────────────────────────────────────────────────────────────

test('Analytics tab loads and renders analytics grid', async ({ page }) => {
  await page.goto(BASE);
  await page.getByRole('button', { name: 'Analytics' }).click();

  // Wait for the analytics grid to appear (loading dots replaced)
  await expect(page.locator('.analytics-grid')).toBeVisible({ timeout: 10000 });
});

// ─── Full Ranking Flow (requires live backend + OpenAI key) ───────────────────

test('ranking candidates with example data shows results', async ({ page }) => {
  test.setTimeout(90000); // GPT-4o agents can take time

  await page.goto(BASE);

  await page.locator('#example-job-btn').click();
  await page.locator('#example-resumes-btn').click();

  // Dismiss any unexpected alerts
  page.on('dialog', dialog => dialog.accept());

  await page.locator('#rank-btn').click();

  // Results section loses the "hidden" class once ranking completes
  await expect(page.locator('#results-section')).not.toHaveClass(/hidden/, { timeout: 90000 });
  await expect(page.locator('#candidates-list')).not.toBeEmpty();
});
