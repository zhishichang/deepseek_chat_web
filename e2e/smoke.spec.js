import { test, expect } from '@playwright/test';

const MOCK_MODELS = {
  data: [
    { id: 'deepseek-chat', object: 'model', owned_by: 'deepseek' },
    { id: 'deepseek-reasoner', object: 'model', owned_by: 'deepseek' },
  ],
};

const MOCK_CHAT_SSE = [
  'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
  'data: {"choices":[{"delta":{"content":" from"}}]}\n\n',
  'data: {"choices":[{"delta":{"content":" AI"}}]}\n\n',
  'data: [DONE]\n\n',
].join('');

test.describe('Smoke test', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API endpoints
    await page.route('**/api/models', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_MODELS),
      })
    );

    await page.route('**/api/chat', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: MOCK_CHAT_SSE,
      })
    );

    await page.goto('/');
  });

  test('page loads and shows main UI', async ({ page }) => {
    // Should see the empty state message
    await expect(page.locator('text=选择或创建一个对话开始聊天')).toBeVisible({ timeout: 5000 });
  });

  test('can send a message and receive response', async ({ page }) => {
    // Click "新建对话" button in sidebar
    const newBtn = page.locator('button:has-text("新建对话")');
    await expect(newBtn).toBeVisible({ timeout: 5000 });
    await newBtn.click();

    // Wait for input to be visible
    const input = page.locator('textarea[placeholder*="输入消息"]');
    await expect(input).toBeVisible({ timeout: 5000 });

    // Type and send message
    await input.fill('Hello AI');
    const sendBtn = page.locator('button[title="发送"]');
    await sendBtn.click();

    // Should see user message
    await expect(page.locator('text=Hello AI')).toBeVisible({ timeout: 5000 });

    // Should see AI response (mocked)
    await expect(page.locator('text=Hello from AI')).toBeVisible({ timeout: 10000 });
  });

  test('no console errors on page load', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Filter out known harmless errors
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('404')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
