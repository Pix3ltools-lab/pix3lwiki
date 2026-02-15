import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_USER_EMAIL!;
const E2E_PASSWORD = process.env.E2E_USER_PASSWORD!;
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3001';

let authCookie: string;
let pageId: string;
let pageSlug: string;
let categoryId: string;

test.describe('Wiki API', () => {
  test('POST /api/auth/login — authenticate and get cookie', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: E2E_EMAIL, password: E2E_PASSWORD },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.user).toBeTruthy();
    expect(body.user.email).toBe(E2E_EMAIL);

    // Extract auth cookie from response headers
    const setCookie = res.headers()['set-cookie'];
    expect(setCookie).toBeTruthy();
    const match = setCookie.match(/auth-token=([^;]+)/);
    expect(match).toBeTruthy();
    authCookie = `auth-token=${match![1]}`;
  });

  test('GET /api/wiki/pages — list pages (authenticated)', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/wiki/pages`, {
      headers: { Cookie: authCookie },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.pages).toBeInstanceOf(Array);
  });

  test('POST /api/wiki/pages — create page', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/wiki/pages`, {
      headers: { Cookie: authCookie },
      data: {
        title: `API Test Page ${Date.now()}`,
        content: '# API Test\n\nCreated via E2E API test.',
        status: 'published',
        tags: ['e2e', 'api-test'],
      },
    });
    expect(res.status()).toBe(201);

    const body = await res.json();
    expect(body.page.id).toBeTruthy();
    expect(body.page.slug).toBeTruthy();
    expect(body.page.status).toBe('published');

    pageId = body.page.id;
    pageSlug = body.page.slug;
  });

  test('GET /api/wiki/pages/by-slug/:slug — get page by slug', async ({ request }) => {
    test.skip(!pageSlug, 'No page available');

    const res = await request.get(`${BASE_URL}/api/wiki/pages/by-slug/${pageSlug}`, {
      headers: { Cookie: authCookie },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.page.slug).toBe(pageSlug);
    expect(body.page.content).toContain('API Test');
  });

  test('PUT /api/wiki/pages/:pageId — update page', async ({ request }) => {
    test.skip(!pageId, 'No page available');

    const res = await request.put(`${BASE_URL}/api/wiki/pages/${pageId}`, {
      headers: { Cookie: authCookie },
      data: {
        title: 'Updated API Test Page',
        content: '# Updated\n\nContent has been updated.',
        change_summary: 'E2E test update',
      },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.version).toBe(2);
  });

  test('GET /api/wiki/pages/:pageId/versions — version history', async ({ request }) => {
    test.skip(!pageId, 'No page available');

    const res = await request.get(`${BASE_URL}/api/wiki/pages/${pageId}/versions`, {
      headers: { Cookie: authCookie },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.versions).toBeInstanceOf(Array);
    expect(body.versions.length).toBeGreaterThanOrEqual(2);
  });

  test('POST /api/wiki/categories — create category', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/wiki/categories`, {
      headers: { Cookie: authCookie },
      data: {
        name: `API Cat ${Date.now()}`,
        description: 'Created via E2E API test',
        color: '#ff5500',
      },
    });
    expect(res.status()).toBe(201);

    const body = await res.json();
    expect(body.category.id).toBeTruthy();
    expect(body.category.color).toBe('#ff5500');

    categoryId = body.category.id;
  });

  test('GET /api/wiki/search — search pages', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/wiki/search?q=API+Test`, {
      headers: { Cookie: authCookie },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.pages).toBeInstanceOf(Array);
    expect(body.query).toBe('API Test');
  });

  test('DELETE /api/wiki/pages/:pageId — delete page', async ({ request }) => {
    test.skip(!pageId, 'No page available');

    const res = await request.delete(`${BASE_URL}/api/wiki/pages/${pageId}`, {
      headers: { Cookie: authCookie },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);

    // Verify page is gone
    const getRes = await request.get(`${BASE_URL}/api/wiki/pages/${pageId}`, {
      headers: { Cookie: authCookie },
    });
    expect(getRes.status()).toBe(404);
  });

  test('POST /api/wiki/pages — 400 validation error', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/wiki/pages`, {
      headers: { Cookie: authCookie },
      data: { content: 'Missing required title field' },
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test('GET /api/wiki/pages — 401 without auth', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/wiki/pages`);
    expect(res.status()).toBe(401);

    const body = await res.json();
    expect(body.error).toBeTruthy();
  });
});
