import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('config', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exports PORT from env or defaults to 3001', async () => {
    const config = await import('../config.js');
    expect(config.PORT).toBeDefined();
    expect(String(config.PORT)).toBe('3001');
  });

  it('exports DEEPSEEK_API_URL', async () => {
    const config = await import('../config.js');
    expect(config.DEEPSEEK_API_URL).toBe('https://api.deepseek.com');
  });

  it('exports DEEPSEEK_API_KEY as string', async () => {
    const config = await import('../config.js');
    expect(typeof config.DEEPSEEK_API_KEY).toBe('string');
  });
});
