import { build, OutputFile } from 'esbuild'
import { TextDecoder } from 'util'
import { WebFont } from '../state/user-schema'
import { State } from '../types'

const buildToString = (value: { outputFiles: OutputFile[] }): string =>
  new TextDecoder('utf-8')
    .decode(value.outputFiles[0].contents)
    .replace(/\n$/, '')

export const fontLoaderScript = async (
  state: State,
  locales: Array<readonly [string, string[]]>,
  fonts: WebFont[]
): Promise<string> =>
  buildToString(
    await build({
      entryPoints: [state.runtimeFontLoaderPath],
      absWorkingDir: state.runtimeFontLoaderPath,
      bundle: true,
      minify: true,
      target: state.targets.esbuild,
      platform: 'browser',
      write: false,
      format: 'iife',
      define: {
        __DATA_FONTS__: JSON.stringify(fonts),
        __DATA_LOCALES__: JSON.stringify(locales)
      }
    })
  )
