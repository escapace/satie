#!/usr/bin/env node

import arg from 'arg'
import chalk from 'chalk'
import { isError } from 'lodash-es'
import {
  DEFAULT_JSON_FILE,
  DEFAULT_OUTPUT_DIR,
  DEFAULT_PUBLIC_PATH
} from './constants'
import { webFont } from './web-font'
import { Options } from './types'

const help = (code: 0 | 1 = 0, message?: string): never => {
  console.log(`Usage: web-font [options]

  Writes locale-optmizied fonts, and a json file with a font-loader script,
  per-locale styles and resource hints.

  Requires a ${chalk.yellow('web-font.config.(ts|mjs|js)')} configuration file
  in the current working directory.

  See ${chalk.blue('https://bit.ly/escapace-web-font')} for the documentation.

Options:
  --output-dir    font output directory path (default: ${DEFAULT_OUTPUT_DIR})
  --json-file     json file output path (default: ${DEFAULT_JSON_FILE})
  --public-path   font public prefix on the web server (default: ${DEFAULT_PUBLIC_PATH})
  -h, --help      display help

Examples:
  ${chalk.gray('# run in a container')}
  docker run --rm -it -v "$(pwd)":/wd escapace/web-font
  ${chalk.gray('# set uid, gid and umask')}
  docker run --rm -it -e UID=$\{UID} -e GID=$\{GID} -e UMASK=0027 -v "$(pwd)":/wd \\
    escapace/web-font
  ${chalk.gray('# write loader file and typescript declaration')}
  docker run --rm -it -v "$(pwd)":/wd escapace/web-font \\
    --declaration --loader-file src/web-font-loader.js
  `)

  if (message !== undefined) {
    console.error(`${chalk.bgRed('ERROR')} ${message}`)
  }

  return process.exit(code)
}

const options = (): Options => {
  try {
    const args = arg({
      '--json-file': String,
      '--output-dir': String,
      '--public-path': String,
      '--help': Boolean,
      '-h': '--help'
    })

    if (args['--help'] === true) {
      return help()
    }

    return {
      jsonFile: args['--json-file'],
      outputDir: args['--output-dir'],
      publicPath: args['--public-path']
    }
  } catch (e) {
    return help(1, isError(e) ? e.message : undefined)
  }
}

void webFont({
  cli: true,
  ...options()
})
