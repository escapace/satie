import { build } from 'esbuild'
import { execa } from 'execa'
import fse from 'fs-extra'
import { chmod, mkdir } from 'fs/promises'
import path from 'path'
import { cwd, external, target, name } from './constants.mjs'

process.umask(0o022)
process.chdir(cwd)

const outdir = path.join(cwd, 'lib/esm')

await fse.remove(outdir)
await mkdir(outdir, { recursive: true })

await build({
  bundle: true,
  entryPoints:
    name === '@escapace/satie'
      ? ['src/index.ts']
      : ['src/index.ts', 'src/cli.ts'],
  treeShaking: true,
  splitting: true,
  external: [...external],
  format: 'esm',
  logLevel: 'info',
  outExtension: { '.js': '.mjs' },
  outbase: path.join(cwd, 'src'),
  outdir,
  platform: 'node',
  minifySyntax: true,
  sourcemap: true,
  target,
  tsconfig: path.join(cwd, 'tsconfig-build.json')
})

await fse.remove(path.join(cwd, 'lib/types'))

await execa(
  path.join(cwd, 'node_modules', '.bin', 'tsc'),
  [
    '-p',
    './tsconfig-build.json',
    '--emitDeclarationOnly',
    '--declarationDir',
    'lib/types'
  ],
  { all: true, cwd }
).catch((reason) => {
  console.error(reason.all)
  process.exit(reason.exitCode)
})
