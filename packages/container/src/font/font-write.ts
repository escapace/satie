import { execa } from 'execa'
import { mkdirp, pathExists } from 'fs-extra'
import { compact, includes, map } from 'lodash-es'
import path from 'path'
import { State, TypeFontState } from '../types'

export const fontWrite = async (slug: string, state: State): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const fontState = state.configuration.fonts.get(slug)!
  const font = fontState.font
  const source = path.resolve(state.configurationDirectory, font.source)

  if (!(await pathExists(source))) {
    throw new Error(`${font.source}: no such file`)
  }

  if (!includes(['.otf', '.ttf', '.woff'], path.extname(source))) {
    throw new Error(
      `${font.source}: not a ttf or cff-flavored opentype (.otf or .ttf) or woff (.woff) font file`
    )
  }

  await mkdirp(state.outputDir)

  const files = await Promise.all(
    map(font.format, async (format): Promise<string> => {
      const outputFile = path.join(
        state.outputDir,
        `${font.name ?? slug}.${format}`
      )

      const fonttools = await execa(
        'pyftsubset',
        compact([
          source,
          format === 'woff' ? '--with-zopfli' : undefined,
          `--output-file=${outputFile}`,
          font.unicodeRange !== undefined
            ? `--unicodes=${font.unicodeRange}`
            : undefined,
          '--harfbuzz-repacker',
          `--flavor=${format}`,
          // TODO: make layout features configurable
          `--layout-features='*'`,
          `--name-IDs=''`,
          `--no-recalc-average-width`,
          `--no-recalc-bounds`,
          `--no-recalc-max-context`,
          `--obfuscate-names`
        ])
      )

      const fontStrip = await execa('python3', [
        state.runtimeFontStripPath,
        '-f',
        outputFile
      ])

      if (
        !(await pathExists(outputFile)) ||
        fonttools.exitCode !== 0 ||
        fontStrip.exitCode !== 0
      ) {
        throw new Error(`${font.source}: fonttools error`)
      }

      return outputFile
    })
  )

  state.configuration.fonts.set(slug, {
    ...fontState,
    type: TypeFontState.Written,
    files
  })
}
