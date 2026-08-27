import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Everything under test is pure: no DOM, no Astro, no React. A jsdom
    // environment would be a dependency bought for nothing.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
