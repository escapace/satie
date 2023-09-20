import { schemaFallback } from '@escapace/satie-container'
import { walk } from '@nodelib/fs.walk'
import { readFile } from 'fs/promises'
import { camelCase, map, pick, sortBy } from 'lodash-es'
import path from 'path'
import { format } from 'prettier'
import { fileURLToPath } from 'url'
import { promisify } from 'util'
import { z } from 'zod'

const dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fonts')

const entries = sortBy(
  await promisify(walk)(dirname, {
    entryFilter: (entry) => path.extname(entry.name) === '.json',
    deepFilter: (entry) => entry.name !== 'alternative'
  }),
  (entry) => entry.name
)

const schemKeys = schemaFallback.keyof().options

type Font = z.infer<typeof schemaFallback>

const fonts: Record<string, Font> = Object.fromEntries(
  await Promise.all(
    entries.map(async (entry): Promise<[string, Font]> => {
      const id = path.basename(entry.name, '.json')
      const key = camelCase(id)

      const value = pick(
        schemaFallback.parse({
          id,
          ...JSON.parse(await readFile(entry.path, 'utf8'))
        }),
        schemKeys
      )

      return [key, value]
    })
  )
)

const code = await format(
  [
    `import { FallbackFont } from './index'`,
    ...map(
      fonts,
      (font, key) =>
        `export const ${key}: FallbackFont = ${JSON.stringify(font)}`
    )
  ].join('\n\n'),
  {
    parser: 'babel-ts',
    printWidth: 80,
    tabWidth: 2,
    semi: false,
    singleQuote: true,
    trailingComma: 'none'
  }
)

console.log(code)

// fonts.forEach((value) => console.log(camelCase(value.id)))
