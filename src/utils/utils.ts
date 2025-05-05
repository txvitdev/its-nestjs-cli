import { dirname } from 'path'
import { fileURLToPath } from 'url'

function getDirname() {
  if (typeof __dirname !== 'undefined') {
    return __dirname
  }
  return dirname(fileURLToPath(import.meta.url))
}

export const Dirname = getDirname()

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))
