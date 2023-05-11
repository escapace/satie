import { build } from 'esbuild'
import fse from 'fs-extra'
import { chmod, mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

export const cwd = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../'
)

export const packageJSON = await fse.readJSON(path.join(cwd, 'package.json'))

process.umask(0o022)
process.chdir(cwd)

const outdir = path.join(cwd, 'lib')

await fse.remove(outdir)
await mkdir(outdir, { recursive: true })

await build({
  bundle: true,
  entryPoints: ['src/index.ts'],
  external: [
    ...Object.keys(packageJSON.dependencies ?? {}),
    ...Object.keys(packageJSON.peerDependencies ?? {})
  ],
  splitting: true,
  format: 'esm',
  logLevel: 'info',
  outExtension: { '.js': '.mjs' },
  outbase: path.join(cwd, 'src'),
  banner: {
    'js': '#!/usr/bin/env node'
  },
  outdir,
  platform: 'node',
  sourcemap: true,
  minifySyntax: true,
  target: [`node18`, 'esnext'],
  tsconfig: path.join(cwd, 'tsconfig.json')
})

await chmod(path.join(outdir, 'index.mjs'), '0755')
