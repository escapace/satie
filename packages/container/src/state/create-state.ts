import { browserslistToTargets } from '@yeuxjs/browserslist-to-targets'
import { findUp } from 'find-up'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  DEFAULT_JSON_FILE,
  DEFAULT_OUTPUT_DIR,
  DEFAULT_PUBLIC_PATH
} from '../constants'
import { Options, State } from '../types'
import { createConfiguration } from './create-configuration'

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

  const targets = browserslistToTargets({
    // browsers: u
    ignoreUnknownVersions: true,
    path: processDirectory
  })

  return {
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
    targets
  }
}
