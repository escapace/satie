import { build } from 'esbuild'
import fastGlob from 'fast-glob'
import {
  filter,
  find,
  isEmpty,
  isObject,
  isString,
  map,
  pickBy
} from 'lodash-es'
import { resolvePath } from 'mlly'
import path, { extname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { TextDecoder } from 'util'
import { SourceTextModule, createContext } from 'vm'
import { SchemaLocales } from '../types'
import { Console } from './console'

export const resolve = async (
  id: string,
  basedir?: string
): Promise<string | undefined> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value = await resolvePath(id, {
      extensions: ['.mjs', '.cjs', '.js', '.json'],
      conditions: ['node', 'import', 'require'],
      url: basedir === undefined ? undefined : pathToFileURL(basedir)
    })

    return typeof value === 'string' ? value : undefined
  } catch {
    return undefined
  }
}

export const configuration = async (cwd: string, console: Console) => {
  try {
    const candidates = await fastGlob(
      ['web-fonts.config.ts', 'web-fonts.config.mjs', 'web-fonts.config.js'],
      {
        absolute: true,
        cwd,
        dot: false
      }
    )

    const configFiles = filter(
      map(['.ts', '.mjs', '.js'], (extension) =>
        find(candidates, (value) => extname(value) === extension)
      ),
      isString
    )

    if (configFiles.length === 0) {
      console.exit(`Could not find a configuration file.`)
    }

    const configFile = configFiles[0]

    const alias = pickBy(
      {
        '@escapace/web-fonts':
          (await resolve('@escapace/web-fonts')) ??
          (await resolve('@escapace/web-fonts', path.dirname(configFile))) ??
          (await resolve(
            '@escapace/web-fonts',
            path.dirname(fileURLToPath(import.meta.url))
          ))
      },
      (value): value is string => typeof value === 'string'
    )

    // console.log(JSON.stringify(alias))

    const { outputFiles } = await build({
      entryPoints: [configFile],
      bundle: true,
      minify: false,
      alias,
      // external: ['@escapace/web-fonts'],
      loader: {
        '.js': 'js',
        '.mjs': 'js',
        '.ts': 'ts',
        '.tsx': 'tsx'
        // '.json': 'json'
      },
      target: [`node${process.version.slice(1)}`],
      absWorkingDir: cwd,
      write: false,
      platform: 'node',
      format: 'esm'
    })

    const contents = new TextDecoder('utf-8').decode(outputFiles[0].contents)

    const context = createContext({
      console
    })

    const module = new SourceTextModule(contents, { context })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    await module.link(async (spec) => await import(spec))
    await module.evaluate()

    if (module.status !== 'evaluated') {
      console.exit(`Could not evaluate the configuration file.`)
    }

    const locales = SchemaLocales.parse(
      find(
        [
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
          (module.namespace as any).default
        ],
        (value) => isObject(value) && !isEmpty(value)
      )
    )

    return { locales, configFile: path.relative(cwd, configFile) }
  } catch (e) {
    console.exit(e)
  }
}
