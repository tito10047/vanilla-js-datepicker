import { test, expect } from '@playwright/test';

// ─── onOpen e2e ──────────────────────────────────────────────────────────────

test.describe('onOpen callback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('onOpen fires on calendar open and logs the visible range', async ({ page }) => {
    const input = page.locator('#dp-onopen');
    await input.click();

    const log = page.locator('#log-onopen');
    await expect(log).toHaveAttribute('data-open-called', 'true', { timeout: 3000 });
    const text = await log.textContent();
    expect(text).toMatch(/Visible:/);
  });

  test('calendar is visible before onOpen resolves', async ({ page }) => {
    const input = page.locator('#dp-onopen');

    // The dropdown should appear synchronously (before onOpen completes)
    const clickPromise = input.click();
    const dropdown = page.locator('.vdp-dropdown').first();

    // Use waitFor with a very short timeout — dropdown should be there immediately
    await expect(dropdown).toBeVisible({ timeout: 500 });
    await clickPromise;
  });
});

// ─── onCellRender e2e ────────────────────────────────────────────────────────

test.describe('onCellRender async results', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('calendar grid renders immediately (before onCellRender completes)', async ({ page }) => {
    const input = page.locator('#dp-async');

    // Start clicking (onCellRender has 50ms delay)
    const clickStart = Date.now();
    await input.click();

    // Dropdown should appear before 50ms (the onCellRender delay)
    const dropdown = page.locator('.vdp-dropdown').first();
    await expect(dropdown).toBeVisible({ timeout: 500 });
    const elapsed = Date.now() - clickStart;
    expect(elapsed).toBeLessThan(2000); // well before timeout
  });

  test('onCellRender badge is applied to the target cell', async ({ page }) => {
    const input = page.locator('#dp-async');
    await input.click();

    // Wait for the async onCellRender to complete (50ms + margin)
    await page.waitForTimeout(300);

    // The 15th of July should have a badge
    const log = page.locator('#log-async');
    await expect(log).toContainText('onCellRender applied badge', { timeout: 2000 });

    // Check that the highlighted-15 class was applied
    const cell = page.locator('[data-date="2026-07-15"].highlighted-15');
    await expect(cell).toBeVisible({ timeout: 2000 });
  });

  test('onCellRender custom className is applied', async ({ page }) => {
    const input = page.locator('#dp-async');
    await input.click();
    await page.waitForTimeout(300);

    const highlighted = page.locator('.highlighted-15');
    await expect(highlighted).toBeVisible({ timeout: 2000 });
  });

  test('clickable=false disables weekend cells', async ({ page }) => {
    const input = page.locator('#dp-disabled');
    await input.click();
    await page.waitForTimeout(200);

    // Weekend cells should have weekend-disabled class and aria-disabled="true"
    const disabledCell = page.locator('.weekend-disabled').first();
    await expect(disabledCell).toBeVisible({ timeout: 2000 });
    await expect(disabledCell).toHaveAttribute('aria-disabled', 'true');
  });
});

// ─── Race guard e2e ──────────────────────────────────────────────────────────

test.describe('race guard — stale async results discarded', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Set a short delay so onCellRender starts but doesn't finish before navigation
    await page.evaluate(() => window.__setSlowDelay(800));
  });

  test('fast month navigation discards stale results', async ({ page }) => {
    const input = page.locator('#dp-slow');

    // Open calendar (starts slow onCellRender for July, 800ms delay)
    await input.click();

    // Immediately click next month (before the 800ms delay fires)
    const nextBtn = page.locator('.vdp-btn-next').first();
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Wait a bit longer than the slow delay to let it complete
    await page.waitForTimeout(1200);

    // The slow-cell-rendered class should be applied to the CURRENT month (August)
    // cells, NOT stale July ones.
    // Verify that visible in-month cells have the class (August cells)
    const renderedCells = page.locator('.slow-cell-rendered');
    const count = await renderedCells.count();
    expect(count).toBeGreaterThan(0);

    // July cells should NOT be visible (calendar shows August)
    // Specifically: July 15 data-date should not be present in-month
    const julyCell = page.locator('[data-date="2026-07-15"]:not(.vdp-cell--out)');
    await expect(julyCell).toHaveCount(0);
  });

  test('calendar shows next month content after navigation', async ({ page }) => {
    const input = page.locator('#dp-slow');
    await input.click();

    const nextBtn = page.locator('.vdp-btn-next').first();
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Header should show August
    const header = page.locator('.vdp-dropdown').first();
    await expect(header).toContainText('august', { timeout: 2000, ignoreCase: true });
  });
});

// ─── Async pipeline ordering ─────────────────────────────────────────────────

test.describe('async pipeline ordering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('dropdown is in DOM before async pipeline completes', async ({ page }) => {
    // The slow card has 800ms delay — verify dropdown is visible before it finishes
    await page.evaluate(() => window.__setSlowDelay(2000));

    const input = page.locator('#dp-slow');
    await input.click();

    // Dropdown should appear immediately (sync render)
    const dropdown = page.locator('.vdp-dropdown').first();
    await expect(dropdown).toBeVisible({ timeout: 1000 });

    // At this point slow-cell-rendered should NOT be on cells yet (still loading)
    const rendered = await page.locator('.slow-cell-rendered').count();
    expect(rendered).toBe(0);

    // Wait for async to complete
    await page.waitForTimeout(2500);

    // Now cells should have the class
    const renderedAfter = await page.locator('.slow-cell-rendered').count();
    expect(renderedAfter).toBeGreaterThan(0);
  });
});
