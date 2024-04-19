import { build } from 'esbuild'
import { findUpMultiple } from 'find-up'
import {
  filter,
  find,
  isEmpty,
  isObject,
  isString,
  map,
  pickBy
} from 'lodash-es'
import { resolvePath } from 'mlly'
import path, { extname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { TextDecoder } from 'node:util'
import { SourceTextModule, createContext } from 'node:vm'
import { flattenConfiguration } from './flatten-configuration'
import { schemaLocales } from './user-schema'

export const resolve = async (
  id: string,
  basedir?: string
): Promise<string | undefined> => {
  try {
    const value = await resolvePath(id, {
      conditions: ['node', 'import', 'require'],
      extensions: ['.mjs', '.cjs', '.js', '.json'],
      url: basedir === undefined ? undefined : pathToFileURL(basedir)
    })

    return typeof value === 'string' ? value : undefined
  } catch {
    return undefined
  }
}

export const createConfiguration = async (processDirectory: string) => {
  const candidates = await findUpMultiple(
    ['satie.config.ts', 'satie.config.mjs', 'satie.config.js'],
    {
      // absolute: true,
      cwd: processDirectory
      // dot: false
    }
  )

  const configFiles = filter(
    map(['.ts', '.mjs', '.js'], (extension) =>
      find(candidates, (value) => extname(value) === extension)
    ),
    isString
  )

  if (configFiles.length === 0) {
    throw new Error(`Could not find a configuration file.`)
  }

  const configFile = configFiles[0]

  const alias = pickBy(
    {
      '@escapace/satie':
        (await resolve('@escapace/satie')) ??
        (await resolve('@escapace/satie', path.dirname(configFile))) ??
        (await resolve(
          '@escapace/satie',
          path.dirname(fileURLToPath(import.meta.url))
        ))
    },
    (value): value is string => typeof value === 'string'
  )

  // console.log(JSON.stringify(alias))

  const configurationDirectory = path.dirname(configFile)

  const { outputFiles } = await build({
    absWorkingDir: configurationDirectory,
    alias,
    bundle: true,
    entryPoints: [configFile],
    format: 'esm',
    // external: ['@escapace/satie'],
    loader: {
      '.js': 'js',
      '.mjs': 'js',
      '.ts': 'ts',
      '.tsx': 'tsx'
      // '.json': 'json'
    },
    minify: false,
    platform: 'node',
    target: [`node${process.version.slice(1)}`],
    write: false
  })

  const contents = new TextDecoder('utf-8').decode(outputFiles[0].contents)

  const context = createContext({
    console
  })

  const module = new SourceTextModule(contents, { context })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  await module.link(async (spec) => await import(spec))
  await module.evaluate()

  if (module.status !== 'evaluated') {
    throw new Error(`Could not evaluate the configuration file.`)
  }

  const configuration = flattenConfiguration(
    schemaLocales.parse(
      find(
        [
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
          (module.namespace as any).default
        ],
        (value) => isObject(value) && !isEmpty(value)
      )
    ),
    configurationDirectory
  )

  return {
    configuration,
    configurationDirectory,
    configurationFile: path.relative(processDirectory, configFile)
  }
}
