import browserslist from 'browserslist'
import { findUp } from 'find-up'
import { browserslistToTargets } from 'lightningcss'
import { includes, isString, map } from 'lodash-es'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  DEFAULT_JSON_FILE,
  DEFAULT_OUTPUT_DIR,
  DEFAULT_PUBLIC_PATH
} from '../constants'
import { Options, State } from '../types'
import { configuration } from './configuration'
import { Console } from './console'

export const createState = async (options: Options): Promise<State> => {
  const dirname = path.dirname(fileURLToPath(import.meta.url))
  const console = new Console(options)
  const declaration = options.declaration === true
  const cwd = options.cwd ?? process.cwd()
  const outputDir = path.resolve(cwd, options.outputDir ?? DEFAULT_OUTPUT_DIR)
  const publicPath = options.publicPath ?? DEFAULT_PUBLIC_PATH
  const jsonFile = path.resolve(cwd, options.jsonFile ?? DEFAULT_JSON_FILE)
  const cacheFonts: State['cacheFonts'] = new Map()
  const loaderFile =
    options.loaderFile === undefined
      ? undefined
      : path.resolve(cwd, options.loaderFile)

  const browsers = browserslist(undefined, {
    ignoreUnknownVersions: true,
    path: cwd
  })

  const lightningCSSTargets = browserslistToTargets(browsers)

  // A function that receives a single 24-bit number, the number represents a
  // semantic version with one semver component (major, minor, patch) per byte.
  // For example, the number 852480 would represent version 13.2.0. The function
  // returns the major minor and patch components of the semantic version.

  const semver = (version: number): [number, number, number] => [
    (version >> 16) & 0xff,
    (version >> 8) & 0xff,
    version & 0xff
  ]

  const BROWSER_MAPPING: Record<string, string | undefined> = {
    chrome: 'chrome',
    edge: 'edge',
    firefox: 'firefox',
    ios_saf: 'ios',
    safari: 'safari'
  }

  const esbuildTargets = map(lightningCSSTargets, (value, key) => {
    const version = typeof value === 'number' ? semver(value) : undefined
    const browser = BROWSER_MAPPING[key]

    if (version !== undefined && browser !== undefined) {
      return `${browser}${version[0]}.${version[1]}.${version[2]}`
    }

    return undefined
  }).filter((value): value is string => value !== undefined)

  if (isString(loaderFile)) {
    const extension = path.extname(loaderFile)

    if (!includes(['.js', '.mjs'], extension)) {
      return console.exit(
        '--loader-file option supports .js, and .mjs extensions'
      )
    }

    if (extension === '.mjs' && declaration) {
      console.warn(`.mjs imports in typescript are not supported`)
    }
  }

  if (loaderFile === undefined && declaration) {
    console.exit('--declaration flag requires --loader-file option')
  }

  if (options.cli === true) {
    console.spinner.start()
  }

  console.spinner.text = 'starting up'

  const packageJSON = await findUp('package.json', { cwd: dirname })

  if (packageJSON === undefined) {
    return console.exit('Damaged installation')
  }

  const absWorkingDir = path.dirname(packageJSON)

  const sourceWebFontLoader = path.join(
    absWorkingDir,
    'src/utilities/font-loader.ts'
  )

  const scriptFontStrip = path.join(
    absWorkingDir,
    'src/utilities/font-strip.py'
  )

  const { locales, configFile } = await configuration(cwd, console)

  console.spinner.text = `read ${configFile}`

  return {
    absWorkingDir,
    cacheFonts,
    console,
    cwd,
    browsers,
    targets: {
      lightningCSS: lightningCSSTargets,
      esbuild: esbuildTargets.length > 0 ? esbuildTargets : undefined
    },
    declaration,
    jsonFile,
    loaderFile,
    locales,
    outputDir,
    publicPath,
    scriptFontStrip,
    sourceWebFontLoader
  }
}
