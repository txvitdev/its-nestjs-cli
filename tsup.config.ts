import { glob } from 'glob'
import path from 'path'
import { defineConfig } from 'tsup'
import fs from 'fs'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  onSuccess: async () => {
    const files = await glob('src/**/*.!(ts|tsx|js|jsx)', { nodir: true })

    for (const file of files) {
      const relativePath = path.relative('src', file)
      const distPathCjs = path.join('dist', relativePath)
      fs.mkdirSync(path.dirname(distPathCjs), { recursive: true })
      fs.copyFileSync(file, distPathCjs)
      console.log(`Copied: ${file} -> ${distPathCjs}`)
    }
  },
})
