import { build, OutputFile } from 'esbuild'
import fse from 'fs-extra'
import path, { dirname } from 'path'
import { TextDecoder } from 'util'
import { Data, State } from '../types'
import { mapValues, omit } from 'lodash-es'

const buildToString = (value: { outputFiles: OutputFile[] }): string =>
  new TextDecoder('utf-8')
    .decode(value.outputFiles[0].contents)
    .replace(/\n$/, '')

export const writeJSONFile = async (
  state: State,
  data: Data
): Promise<{ script: string }> => {
  const script = buildToString(
    await build({
      entryPoints: [state.sourceWebFontLoader],
      absWorkingDir: state.absWorkingDir,
      bundle: true,
      minify: true,
      target: state.targets.esbuild,
      platform: 'browser',
      write: false,
      format: 'iife',
      define: {
        __DATA_FONTS__: JSON.stringify(data.fontsIndex),
        __DATA_LOCALE_INDEX__: JSON.stringify(data.localeIndex)
      }
    })
  )

  const json = {
    locales: mapValues(data.locales, (locale) => ({
      ...omit(locale, 'resourceHint'),
      resourceHints: locale.resourceHint
    })),
    fonts: data.fonts,
    fontFace: data.fontFace,
    noScriptStyle: data.noScriptStyle,
    script,
    style: data.style
  }

  await fse.mkdirp(dirname(state.jsonFile))
  await fse.writeJson(state.jsonFile, json, { spaces: '  ' })

  state.console.spinner.text = `wrote ${path.relative(
    state.cwd,
    state.jsonFile
  )}`

  return { script }
}
