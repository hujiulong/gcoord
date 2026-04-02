import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'cobertura'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: ['test/helpers/**'],
    },
    globals: true,
  },
});
