import { TypeFontIssue, metricsFromFont } from '@escapace/web-fonts-container'
import arg from 'arg'
import chalk from 'chalk'
import { Font, openSync } from 'fontkit'
import { existsSync, readFileSync, renameSync, writeFileSync } from 'fs'
import { isEqual, kebabCase, noop, uniq } from 'lodash-es'
import path from 'path'

const ICON = '>'

const WEIGHTS: Array<[number, string[]]> = [
  [100, ['thin', 'hairline']],
  [200, ['extra light', 'ultra light']],
  [300, ['light']],
  [400, ['normal', 'regular']],
  [500, ['medium']],
  [600, ['semi bold', 'demi bold']],
  [700, ['bold']],
  [800, ['extra bold', 'ultra bold']],
  [900, ['black', 'heavy']],
  [950, ['extra black', 'ultra black']]
]

const args = arg(
  {
    '--path': String,
    '--name': String,
    '--weight': Number,
    '--italic': Boolean,
    '--variable': Boolean
  },
  {
    permissive: false
  }
)

const help = (): never => {
  console.error('error')
  process.exit(1)
}

if (typeof args['--path'] !== 'string') {
  help()
}

const filepath = path.resolve(process.cwd(), args['--path'] as string)

if (!existsSync(filepath)) {
  help()
}

if (
  typeof args['--weight'] === 'number' &&
  !WEIGHTS.map(([weight]) => weight).includes(args['--weight'])
) {
  help()
  process.exit(1)
}

const extension = path.extname(filepath)
const filename = path.basename(filepath)
const directory = path.dirname(filepath)

let RENAME = extension !== '.ttc'

if (extension === '.ttc' && typeof args['--name'] === 'undefined') {
  help()
  process.exit(1)
}

const openFont = (): Font => {
  try {
    if (args['--variable'] === true) {
      RENAME = false

      const font = openSync(filepath)
      // @ts-expect-error typings
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return (font.getVariation as Function)(args['--name'])
    } else {
      const font = openSync(filepath, args['--name'])
      noop(metricsFromFont(font))

      return font
    }
  } catch {
    console.log(`${chalk.red(ICON)} ${filename}: unable to load font.`)
    process.exit(1)
  }
}

const font = openFont()

const content = metricsFromFont(font)

const issues = content.issues ?? []

issues.forEach(({ description, type }) => {
  const icon =
    type === TypeFontIssue.Error ? chalk.red(ICON) : chalk.yellow(ICON)

  if (type === TypeFontIssue.Error) {
    console.error(`${icon} ${filename}: ${description}`)
  } else {
    console.warn(`${icon} ${filename}: ${description}`)
  }
})

const hasCriticalIssues = issues.some(
  ({ type }) => type === TypeFontIssue.Error
)

if (hasCriticalIssues) {
  console.error(
    `${chalk.red(ICON)} ${filename}: unable to continue due to critical issues.`
  )
  process.exit(1)
}

if (args['--variable'] === true) {
  content.subfamilyName = args['--name'] as string
  content.fullName = `${content.familyName} ${content.subfamilyName}`
  content.postscriptName = `${content.familyName.replace(
    /\s/g,
    ''
  )}-${content.subfamilyName.replace(/\s/g, '')}`
}

const weights = WEIGHTS.filter(
  ([_, strings]) =>
    strings.filter(
      (string) =>
        content.postscriptName.toLowerCase().includes(string) ||
        content.postscriptName.toLowerCase().includes(kebabCase(string)) ||
        kebabCase(content.postscriptName).includes(kebabCase(string)) ||
        kebabCase(content.subfamilyName).includes(kebabCase(string))
    ).length !== 0
).map(([weight]) => weight)

if (
  typeof args['--weight'] === 'undefined' &&
  (weights.length === 0 || weights.length > 1)
) {
  console.error(
    `${chalk.red(ICON)} ${filename}: unable to determine the weight.`
  )
  process.exit(1)
}

const weight = args['--weight'] ?? weights[0]
const italic =
  args['--italic'] === undefined
    ? content.postscriptName.toLowerCase().toLowerCase().includes('italic') ||
      content.subfamilyName.toLowerCase().toLowerCase().includes('italic') ||
      content.fullName.toLowerCase().toLowerCase().includes('italic') ||
      content.postscriptName.toLowerCase().toLowerCase().includes('oblique') ||
      content.subfamilyName.toLowerCase().toLowerCase().includes('oblique') ||
      content.fullName.toLowerCase().toLowerCase().includes('oblique')
    : args['--italic']

const newFilename = `${kebabCase(
  `${content.familyName}-${content.subfamilyName}`
)}${extension}`
const newPath = path.join(directory, newFilename)
const rename = RENAME && filename !== newFilename

const jsonFilename = `${kebabCase(
  `${content.familyName}-${content.subfamilyName}`
)}.json`
const jsonPath = path.join(directory, jsonFilename)

if (rename) {
  if (existsSync(newPath)) {
    console.error(
      `${chalk.red(ICON)} Unable to rename '${filename}' to '${newFilename}'.`
    )
    process.exit(1)
  }
}

const names = uniq([
  content.postscriptName,
  content.fullName,
  `${content.familyName} ${content.subfamilyName}`
])

const json = JSON.stringify({ names, weight, italic, ...content }, null, 2)

if (existsSync(jsonPath) && !isEqual(readFileSync(jsonPath, 'utf8'), json)) {
  console.error(`${chalk.red(ICON)} Unable to write '${jsonFilename}'.`)
  process.exit(1)
}

if (rename) {
  renameSync(filepath, newPath)
  console.info(`Renamed '${filename}' to '${newFilename}'.`)
}

writeFileSync(jsonPath, json)

console.info(`Wrote '${jsonFilename}'.`)
