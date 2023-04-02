import zlib from 'zlib'
import { Size } from '../types'

const brotliSize = (value: string | Buffer) =>
  zlib.brotliCompressSync(value).length
const gzipSize = (value: string | Buffer) => zlib.gzipSync(value).length

export const size = (contents: string | Buffer): Size => ({
  brotli: brotliSize(contents),
  gzip: gzipSize(contents)
})
