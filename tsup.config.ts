import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['neutron.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  shims: true,
  outDir: 'build'
})