import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Node by default: most of what is under test is pure, and the
    // first-touch tests in analytics.test.ts install and delete their own
    // fake `window`, which a real DOM environment would fight over.
    //
    // engagement.test.ts opts into happy-dom with a `@vitest-environment`
    // docblock, because the two helpers that walk up from a clicked
    // element to name where it sits are DOM traversal and there is no
    // honest way to test them without one.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
