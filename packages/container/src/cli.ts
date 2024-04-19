#!/usr/bin/env node

import arg from 'arg'
import chalk from 'chalk'
import { isError } from 'lodash-es'
import {
  DEFAULT_JSON_FILE,
  DEFAULT_OUTPUT_DIR,
  DEFAULT_PUBLIC_PATH
} from './constants'
import { satie } from './satie'
import type { Options } from './types'

const help = (code: 0 | 1 = 0, message?: string): never => {
  console.log(`Usage: satie [options]

  Writes locale-optmizied fonts, and a json file with a font-loader script,
  per-locale styles and resource hints.

  Requires a ${chalk.yellow('satie.config.(ts|mjs|js)')} configuration file
  in the current working directory.

  See ${chalk.blue('https://bit.ly/escapace-satie')} for the documentation.

Options:
  --output-dir    font output directory path (default: ${DEFAULT_OUTPUT_DIR})
  --json-file     json file output path (default: ${DEFAULT_JSON_FILE})
  --public-path   font public prefix on the web server (default: ${DEFAULT_PUBLIC_PATH})
  -h, --help      display help

Examples:
  ${chalk.gray('# run in a container')}
  docker run --rm -it -v "$(pwd)":/wd escapace/satie
  ${chalk.gray('# set uid, gid and umask')}
  docker run --rm -it -e UID=$\{UID} -e GID=$\{GID} -e UMASK=0027 -v "$(pwd)":/wd \\
    escapace/satie
  ${chalk.gray('# write loader file and typescript declaration')}
  docker run --rm -it -v "$(pwd)":/wd escapace/satie \\
    --declaration --loader-file src/satie-loader.js
  `)

  if (message !== undefined) {
    console.error(`${chalk.bgRed('ERROR')} ${message}`)
  }

  return process.exit(code)
}

const options = (): Options => {
  try {
    const arguments_ = arg({
      '--help': Boolean,
      '--json-file': String,
      '--output-dir': String,
      '--public-path': String,
      '-h': '--help'
    })

    if (arguments_['--help'] === true) {
      return help()
    }

    return {
      jsonFile: arguments_['--json-file'],
      outputDir: arguments_['--output-dir'],
      publicPath: arguments_['--public-path']
    }
  } catch (error) {
    return help(1, isError(error) ? error.message : undefined)
  }
}

void satie({
  cli: true,
  ...options()
})
