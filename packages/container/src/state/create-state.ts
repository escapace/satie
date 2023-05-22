import browserslist from 'browserslist'
import { findUp } from 'find-up'
import { browserslistToTargets } from 'lightningcss'
import { map } from 'lodash-es'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  DEFAULT_JSON_FILE,
  DEFAULT_OUTPUT_DIR,
  DEFAULT_PUBLIC_PATH
} from '../constants'
import { Options, State } from '../types'
import { createConfiguration } from './create-configuration'
import { existsSync } from 'fs'

export const createState = async (options: Options): Promise<State> => {
  const runtimePackageJSON = await findUp('package.json', {
    cwd: path.dirname(fileURLToPath(import.meta.url))
  })

  if (runtimePackageJSON === undefined) {
    throw new Error('Damaged installation')
  }

  const runtimeDirectory = path.dirname(runtimePackageJSON)
  const runtimeFontLoaderPath = path.join(
    runtimeDirectory,
    'src/font/font-loader.ts'
  )
  const runtimeFontStripPath = path.join(
    runtimeDirectory,
    'src/font/font-strip.py'
  )

  if (!existsSync(runtimeFontStripPath) || !existsSync(runtimeFontLoaderPath)) {
    throw new Error('Damaged installation')
  }

  const processDirectory = options.cwd ?? process.cwd()
  const { configuration, configurationFile, configurationDirectory } =
    await createConfiguration(processDirectory)
  const outputDir = path.resolve(
    processDirectory,
    options.outputDir ?? DEFAULT_OUTPUT_DIR
  )
  const publicPath = options.publicPath ?? DEFAULT_PUBLIC_PATH
  const jsonFile = path.resolve(
    processDirectory,
    options.jsonFile ?? DEFAULT_JSON_FILE
  )

  const browsers = browserslist(undefined, {
    ignoreUnknownVersions: true,
    path: processDirectory
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

  return {
    browsers,
    configuration,
    configurationDirectory,
    configurationFile,
    jsonFile,
    outputDir,
    processDirectory,
    publicPath,
    runtimeDirectory,
    runtimeFontLoaderPath,
    runtimeFontStripPath,
    targets: {
      lightningCSS: lightningCSSTargets,
      esbuild: esbuildTargets.length > 0 ? esbuildTargets : undefined
    }
  }
}
