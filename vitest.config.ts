import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom environment for DOM testing
    environment: 'jsdom',

    // Setup files to run before each test file
    setupFiles: ['./tests/setup.ts'],

    // Include test files
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    // Exclude E2E tests (handled by Playwright)
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'tests/e2e/**',
      '**/*.e2e.{test,spec}.{js,ts,jsx,tsx}',
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '.next/',
        'coverage/',
      ],
    },

    // Globals (allows using describe, it, expect without importing)
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
