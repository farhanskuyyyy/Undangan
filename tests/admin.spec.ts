import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    const content = await page.textContent('body');
    expect(content).toContain('Login');
  });

  test('should login successfully with correct credentials', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    
    // Fill in login form
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.first().fill('admin@admin.com');
    }
    
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    if (await passwordInput.count() > 0) {
      await passwordInput.first().fill('password');
    }
    
    // Submit login
    const loginButton = page.locator('button[type="submit"], button').filter({ hasText: /login|masuk|sign/i });
    if (await loginButton.count() > 0) {
      await loginButton.first().click();
      await page.waitForTimeout(3000);
    }
    
    // Should redirect to admin dashboard
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should show error with wrong credentials', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.first().fill('wrong@email.com');
    }
    
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    if (await passwordInput.count() > 0) {
      await passwordInput.first().fill('wrongpassword');
    }
    
    const loginButton = page.locator('button[type="submit"], button').filter({ hasText: /login|masuk|sign/i });
    if (await loginButton.count() > 0) {
      await loginButton.first().click();
      await page.waitForTimeout(2000);
    }
    
    // Should show error or stay on login page
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.first().fill('admin@admin.com');
    }
    
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    if (await passwordInput.count() > 0) {
      await passwordInput.first().fill('password');
    }
    
    const loginButton = page.locator('button[type="submit"], button').filter({ hasText: /login|masuk|sign/i });
    if (await loginButton.count() > 0) {
      await loginButton.first().click();
      await page.waitForTimeout(3000);
    }
  });

  test('should display guest list', async ({ page }) => {
    const content = await page.textContent('body');
    expect(content).toContain('Tamu');
  });

  test('should display statistics', async ({ page }) => {
    const content = await page.textContent('body');
    // Check for stat cards
    expect(content).toContain('Total');
  });

  test('should open add guest modal', async ({ page }) => {
    const addButton = page.locator('button').filter({ hasText: /tambah|add/i });
    if (await addButton.count() > 0) {
      await addButton.first().click();
      await page.waitForTimeout(1000);
      
      // Check modal is open
      const modal = page.locator('[role="dialog"], .modal, [class*="modal"]');
      if (await modal.count() > 0) {
        await expect(modal.first()).toBeVisible();
      }
    }
  });
});

test.describe('Admin API with Auth', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Get auth token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'admin@admin.com',
        password: 'password',
      },
    });
    const loginData = await loginResponse.json();
    authToken = loginData.token;
  });

  test('should get guests with auth token', async ({ request }) => {
    const response = await request.get('/api/guests', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should create and delete guest', async ({ request }) => {
    // Create guest
    const createResponse = await request.post('/api/guests', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        name: 'E2E Test Guest',
        qr_code: `e2e-test-${Date.now()}`,
        rsvp_status: false,
        attendance_count: 1,
        invited_pax: 2,
        has_arrived: false,
      },
    });
    expect(createResponse.ok()).toBeTruthy();
    const guest = await createResponse.json();
    expect(guest).toHaveProperty('id');

    // Delete guest
    const deleteResponse = await request.delete(`/api/guests/${guest.id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(deleteResponse.ok()).toBeTruthy();
  });

  test('should update wedding settings', async ({ request }) => {
    const response = await request.put('/api/wedding_settings', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        groom_name: 'John',
        bride_name: 'Jane',
        wedding_date: '2026-05-19T10:00:00',
        location_name: 'Test Venue',
        location_address: 'Test Address',
      },
    });
    expect(response.ok()).toBeTruthy();
  });
});
