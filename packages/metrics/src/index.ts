import {
  FontMetrics,
  fontFamilyToCamelCase,
  metricsFromFont,
  TypeFontIssue
} from '@escapace/web-fonts-container'
import { openSync } from 'fontkit'
import { readFile, writeFile } from 'fs/promises'
import { intersection, isEqual, keys, omit } from 'lodash-es'
import path from 'path'
import { fileURLToPath } from 'url'

// function fontFamilyToCamelCase(str: string) {
//   return str
//     .split(/[\s|-]/)
//     .filter(Boolean)
//     .map(
//       (s, i) =>
//         `${s.charAt(0)[i > 0 ? 'toUpperCase' : 'toLowerCase']()}${s.slice(1)}`
//     )
//     .join('')
// }

const directory = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'fonts'
)

const from = (
  filename: string,
  postscriptName?: string,
  overrides?: Partial<FontMetrics>
): FontMetrics => {
  try {
    const metrics = {
      ...metricsFromFont(
        openSync(path.join(directory, filename), postscriptName)
      ),
      ...overrides
    }

    const issues = metrics.issues ?? []

    issues.forEach(({ description }) => {
      console.warn(`${filename} (${metrics.familyName}): ${description}`)
    })

    issues.forEach(({ type }) => {
      if (type === TypeFontIssue.Error) {
        throw new Error(
          `${filename} (${metrics.familyName}): Critical issue(s).`
        )
      }
    })

    return metrics
  } catch (e) {
    console.error(`Issue with ${filename}`)

    throw e
  }
}

const fonts: FontMetrics[] = [
  from('Arial Nova.otf'),
  from('Avenir Next LT Pro.otf'),
  from('Avenir.ttc', 'Avenir-Roman'),
  from('Bahnschrift.ttf'),
  from('Bitstream Charter.otf', undefined, { familyName: 'Bitstream Charter' }),
  from('Bodoni MT.otf'),
  from('Bradley Hand.ttf'),
  from('Cascadia Code.otf'),
  from('Cascadia Mono.otf'),
  from('Charter.ttc', 'Charter-Roman'),
  from('Courier New.ttf'),
  from('DejaVu Sans Mono.ttf'),
  from('DejaVu Sans.ttf'),
  from('DejaVu Serif.ttf'),
  from('Didot.ttc', 'Didot'),
  from('DIN Alternate.ttf'),
  from('Droid Sans Mono.ttf'),
  from('Gill Sans Nova.ttf'),
  from('Hiragino Maru Gothic ProN.ttc', 'HiraMaruProN-W4'),
  from('Lucida Grande.ttc', 'LucidaGrande'),
  from('Menlo.ttc', 'Menlo-Regular'),
  from('Optima.ttc', 'Optima-Regular'),
  from('Palatino.ttc', 'Palatino-Roman'),
  from('Rockwell.ttc', 'Rockwell-Regular'),
  from('San Francisco Display.otf'),
  from('San Francisco Text.otf'),
  from('SF Mono.otf'),
  from('SF Pro Display.otf'),
  from('SF Pro Rounded.otf'),
  from('SF Pro Text.otf'),
  from('SF Pro.ttf')
]

const dirname = path.dirname(fileURLToPath(import.meta.url))

const capsizeFontMetrics = JSON.parse(
  await readFile(path.join(dirname, 'capsize-font-metrics.json'), 'utf8')
) as Record<string, FontMetrics>

const fontMetrics = Object.fromEntries(
  fonts
    .sort((a, b) => {
      const fontA = a.familyName.toUpperCase()
      const fontB = b.familyName.toUpperCase()

      return fontA < fontB ? -1 : fontA > fontB ? 1 : 0
    })
    .map((value): [string, FontMetrics] => [
      fontFamilyToCamelCase(value.familyName),
      value
    ])
)

intersection(keys(capsizeFontMetrics), keys(fontMetrics)).forEach((key) => {
  const capsizeValue = omit(capsizeFontMetrics[key], ['category'])
  const value = omit(fontMetrics[key], ['issues'])

  if (!isEqual(capsizeValue, value)) {
    console.error('Conflicting values.')
    console.error(
      JSON.stringify({ capsize: capsizeValue, current: value }, null, 2)
    )
    process.exit(1)
  }
})

await writeFile(
  path.resolve(dirname, '../../container/src/metrics.json'),
  JSON.stringify({ ...capsizeFontMetrics, ...fontMetrics }, null, 2)
)
