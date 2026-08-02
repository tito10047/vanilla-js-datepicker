import { test, expect } from '@playwright/test';

// ─── Date cell click ─────────────────────────────────────────────────────────

test.describe('clicking date cells', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('clicking a day cell selects the date and closes the dropdown', async ({ page }) => {
    const input = page.locator('#dp-basic');
    await input.click();

    const dropdown = page.locator('.vdp-dropdown').first();
    await expect(dropdown).toBeVisible({ timeout: 2000 });

    // Click any in-month cell that is visible
    const cell = dropdown.locator('button.vdp-cell:not(.vdp-cell--out)').first();
    const dateAttr = await cell.getAttribute('data-date');
    await cell.click();

    // Dropdown should close after click (closeOnSelect: true by default)
    await expect(dropdown).not.toBeVisible({ timeout: 2000 });

    // Input should contain the clicked date
    await expect(input).toHaveValue(dateAttr!);
  });

  test('clicking a date cell on a datepicker with initial value changes the value', async ({ page }) => {
    // dp-minmax has value:'2026-07-15', minDate:'2026-07-10', maxDate:'2026-07-20'
    const input = page.locator('#dp-minmax');
    await input.click();

    const dropdown = page.locator('.vdp-dropdown').first();
    await expect(dropdown).toBeVisible({ timeout: 2000 });

    // Click July 18 (within min/max range)
    const cell = dropdown.locator('[data-date="2026-07-18"]');
    await cell.click();

    await expect(dropdown).not.toBeVisible({ timeout: 2000 });
    await expect(input).toHaveValue('2026-07-18');
  });

  test('clicking prev/next month buttons navigates the calendar', async ({ page }) => {
    const input = page.locator('#dp-minmax');
    await input.click();

    const dropdown = page.locator('.vdp-dropdown').first();
    await expect(dropdown).toBeVisible({ timeout: 2000 });

    // July 2026 should be visible
    const julyCell = dropdown.locator('[data-date="2026-07-15"]');
    await expect(julyCell).toBeVisible();

    // Click next month — should navigate to August 2026
    const nextBtn = dropdown.locator('.vdp-btn-next');
    await nextBtn.click();

    // August 2026 cell should now be visible
    const augCell = dropdown.locator('[data-date="2026-08-15"]');
    await expect(augCell).toBeVisible({ timeout: 2000 });
  });

  test('clicking month header button switches to month view', async ({ page }) => {
    const input = page.locator('#dp-basic');
    await input.click();

    const dropdown = page.locator('.vdp-dropdown').first();
    await expect(dropdown).toBeVisible({ timeout: 2000 });

    const monthBtn = dropdown.locator('.vdp-btn-month');
    await monthBtn.click();

    await expect(dropdown.locator('.vdp-month-grid')).toBeVisible({ timeout: 2000 });
  });

  test('clicking a month in month view navigates to days view', async ({ page }) => {
    const input = page.locator('#dp-basic');
    await input.click();

    const dropdown = page.locator('.vdp-dropdown').first();
    await expect(dropdown).toBeVisible({ timeout: 2000 });

    await dropdown.locator('.vdp-btn-month').click();
    await expect(dropdown.locator('.vdp-month-grid')).toBeVisible({ timeout: 2000 });

    // Click the first month cell
    const monthCell = dropdown.locator('.vdp-month-cell').first();
    await monthCell.click();

    // Should be back on days view
    await expect(dropdown.locator('.vdp-day-grid')).toBeVisible({ timeout: 2000 });
  });

  test('range mode: clicking two dates selects a range', async ({ page }) => {
    const input = page.locator('#dp-range');
    await input.click();

    const dropdown = page.locator('.vdp-dropdown').first();
    await expect(dropdown).toBeVisible({ timeout: 2000 });

    // Navigate to a month with known dates
    // Currently showing current month (August 2026)
    const cell10 = dropdown.locator('[data-date="2026-08-10"]');
    const cell20 = dropdown.locator('[data-date="2026-08-20"]');
    await cell10.click();
    await cell20.click();

    await expect(dropdown).not.toBeVisible({ timeout: 2000 });
    const value = await input.inputValue();
    expect(value).toContain('2026-08-10');
    expect(value).toContain('2026-08-20');
  });

  test('today button selects today and closes calendar', async ({ page }) => {
    const input = page.locator('#dp-footer');
    await input.click();

    const dropdown = page.locator('.vdp-dropdown').first();
    await expect(dropdown).toBeVisible({ timeout: 2000 });

    const todayBtn = dropdown.locator('.vdp-btn-today');
    await todayBtn.click();

    // Should close and have today's date
    await expect(dropdown).not.toBeVisible({ timeout: 2000 });
    const value = await input.inputValue();
    const today = new Date();
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(value).toBe(expected);
  });
});
