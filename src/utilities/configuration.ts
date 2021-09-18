import { build } from 'esbuild'
import fastGlob from 'fast-glob'
import { filter, find, isString, map } from 'lodash-es'
import path, { extname } from 'path'
import { createContext, runInNewContext } from 'vm'
import { SchemaLocales } from '../types'
import { Console } from './console'

export const configuration = async (cwd: string, console: Console) => {
  try {
    const candidates = await fastGlob(
      [
        'web-fonts.config.ts',
        'web-fonts.config.mjs',
        'web-fonts.config.cjs',
        'web-fonts.config.js',
        'web-fonts.config.json'
      ],
      {
        absolute: true,
        cwd,
        dot: false
      }
    )

    const configFiles = filter(
      map(['.ts', '.mjs', '.cjs', '.js' /*, '.json' */], (extension) =>
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
        '.cjs': 'js',
        '.ts': 'ts',
        '.tsx': 'tsx'
        // '.json': 'json'
      },
      target: [`node${process.version.slice(1)}`],
      absWorkingDir: cwd,
      write: false,
      platform: 'node',
      format: 'cjs'
    })

    const contents = new TextDecoder('utf-8').decode(outputFiles[0].contents)

    const context = createContext({
      exports: {},
      module: {},
      require,
      console
    })

    runInNewContext(contents, context)

    const locales = SchemaLocales.parse(
      context.exports.default ?? context.exports
    )

    return { locales, configFile: path.relative(cwd, configFile) }
  } catch (e) {
    console.exit(e)
  }
}
