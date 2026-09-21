import { test, expect } from '@playwright/test';

test.describe('Invitation Page', () => {
  test('should load the invitation page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Wedding/);
  });

  test('should display envelope with names', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should open envelope and show invitation', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Try to find and click the open button
    const openButton = page.locator('button, [role="button"]').filter({ hasText: /buka|open|undangan/i });
    if (await openButton.count() > 0) {
      await openButton.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Check that content is visible
    const body = await page.textContent('body');
    expect(body).toContain('John');
  });

  test('should display wedding details', async ({ page }) => {
    await page.goto('/?to=GUEST-001');
    await page.waitForTimeout(3000);
    
    // Open envelope if present
    const openButton = page.locator('button, [role="button"]').filter({ hasText: /buka|open|undangan/i });
    if (await openButton.count() > 0) {
      await openButton.first().click();
      await page.waitForTimeout(1000);
    }
    
    const content = await page.textContent('body');
    expect(content).toContain('John');
    expect(content).toContain('Jane');
  });
});

test.describe('RSVP Form', () => {
  test('should display RSVP form for valid guest', async ({ page }) => {
    await page.goto('/?to=GUEST-001');
    await page.waitForTimeout(3000);
    
    // Open envelope
    const openButton = page.locator('button, [role="button"]').filter({ hasText: /buka|open|undangan/i });
    if (await openButton.count() > 0) {
      await openButton.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Scroll to RSVP section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Check for RSVP form elements
    const content = await page.textContent('body');
    expect(content).toContain('RSVP');
  });

  test('should submit RSVP via API', async ({ request }) => {
    // Test RSVP submission directly via API
    const response = await request.post('/api/guests', {
      data: {
        name: 'Playwright RSVP Test',
        qr_code: `pw-rsvp-${Date.now()}`,
        rsvp_status: true,
        attendance_count: 2,
        invited_pax: 2,
        message: 'Selamat menikah dari Playwright!',
        has_arrived: false,
      },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.name).toBe('Playwright RSVP Test');
  });
});

test.describe('API Endpoints', () => {
  test('GET /api/wedding_settings should return settings', async ({ request }) => {
    const response = await request.get('/api/wedding_settings');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('groom_name');
    expect(data).toHaveProperty('bride_name');
  });

  test('GET /api/guests should return guests list', async ({ request }) => {
    // Login first to get token
    const loginRes = await request.post('/api/auth/login', {
      data: { email: 'admin@admin.com', password: 'password' },
    });
    const { token } = await loginRes.json();
    
    const response = await request.get('/api/guests', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('POST /api/guests should create a guest', async ({ request }) => {
    const response = await request.post('/api/guests', {
      data: {
        name: 'Playwright Test Guest',
        qr_code: `pw-test-${Date.now()}`,
        rsvp_status: false,
        attendance_count: 1,
        invited_pax: 2,
        has_arrived: false,
      },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('id');
  });

  test('POST /api/auth/login should return token', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'admin@admin.com',
        password: 'password',
      },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('token');
  });
});
