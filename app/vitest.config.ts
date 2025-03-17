import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import {defineConfig} from 'vitest/config'

dotenv.config({path: '.env.test'})

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './test/setup.ts',
  },
})
