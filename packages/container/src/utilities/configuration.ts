import { build } from 'esbuild'
import fastGlob from 'fast-glob'
import { filter, find, isEmpty, isObject, isString, map } from 'lodash-es'
import path, { extname } from 'path'
import { TextDecoder } from 'util'
import { SourceTextModule, createContext } from 'vm'
import { SchemaLocales } from '../types'
import { Console } from './console'

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

    const { outputFiles } = await build({
      entryPoints: [configFile],
      bundle: true,
      minify: false,
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
