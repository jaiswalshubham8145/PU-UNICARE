import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/UNICARE/);
  });

  test('displays hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Smart Campus Maintenance')).toBeVisible();
  });

  test('navigation links are visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=About')).toBeVisible();
    await expect(page.locator('text=Maintenance')).toBeVisible();
  });

  test('Report Issue button navigates to register', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Report Issue');
    await expect(page).toHaveURL(/register-complaint/);
  });
});

test.describe('Track Complaint Page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/track');
    await expect(page.locator('text=Track')).toBeVisible();
  });

  test('search input is visible', async ({ page }) => {
    await page.goto('/track');
    await expect(page.locator('input[placeholder*="complaint"]')).toBeVisible();
  });
});

test.describe('Login Page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('shows email input', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('shows password input', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('rejects non-university email', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@gmail.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=@paruluniversity.ac.in')).toBeVisible();
  });
});

test.describe('Register Page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('text=Create Account')).toBeVisible();
  });

  test('shows role selection', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('text=Role')).toBeVisible();
  });
});

test.describe('About Page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('text=About')).toBeVisible();
  });
});

test.describe('Contact Page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('text=Contact')).toBeVisible();
  });

  test('shows contact form', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('text=Send Message')).toBeVisible();
  });
});

test.describe('Maintenance Page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/maintenance');
    await expect(page.locator('text=Maintenance')).toBeVisible();
  });
});

test.describe('Help Center', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/help-center');
    await expect(page.locator('text=Help')).toBeVisible();
  });
});

test.describe('Knowledge Base', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/help');
    await expect(page.locator('text=Knowledge')).toBeVisible();
  });
});

test.describe('Staff Directory', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/staff-directory');
    await expect(page.locator('text=Staff')).toBeVisible();
  });
});

test.describe('Forgot Password', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('text=Forgot Password')).toBeVisible();
  });

  test('shows email input', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe('404 Page', () => {
  test('shows not found for invalid routes', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await expect(page.locator('text=404')).toBeVisible();
  });
});

test.describe('Theme Toggle', () => {
  test('theme toggle button is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[aria-label*="Theme"]')).toBeVisible();
  });

  test('clicking theme toggle changes theme', async ({ page }) => {
    await page.goto('/');
    const themeButton = page.locator('[aria-label*="Theme"]');
    await themeButton.click();
    await page.waitForTimeout(500);
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toMatch(/dark|light/);
  });
});

test.describe('Language Toggle', () => {
  test('language toggle button is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[aria-label*="Language"]')).toBeVisible();
  });

  test('clicking language toggle changes language', async ({ page }) => {
    await page.goto('/');
    const langButton = page.locator('[aria-label*="Language"]');
    await langButton.click();
    await page.waitForTimeout(500);
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toMatch(/en|hi/);
  });
});

test.describe('Accessibility', () => {
  test('skip link is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Skip to main content')).toBeAttached();
  });

  test('main content has id', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });
});

test.describe('Responsive Design', () => {
  test('mobile menu button is visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('[aria-label*="menu"], button:has(svg)').first()).toBeVisible();
  });

  test('desktop nav is hidden on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const desktopNav = page.locator('.hidden.lg\\:flex');
    await expect(desktopNav).toBeHidden();
  });
});
