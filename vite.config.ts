import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/platonic-solids/',
  plugins: [react()],
  optimizeDeps: { include: ['three/examples/jsm/geometries/ConvexGeometry.js'] },
  test: {
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
  },
})
