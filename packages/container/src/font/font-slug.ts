import { createHash as cryptoHash } from 'crypto'
import { readFileSync } from 'fs'
import { pick } from 'lodash-es'
import path from 'path'
import { InferFont } from '../state/user-schema'
import type { TupleUnion } from '../types'
import { createHash } from '../utilities/create-hash'

// export type SlugParts =
//   | 'family'
//   | 'stretch'
//   | 'style'
//   | 'tech'
//   | 'unicodeRange'
//   | 'weight'
// export type SlugNonParts = Exclude<keyof (InputFont | InferFont), SlugParts>

const SLUG_PARTS: TupleUnion<
  Exclude<
    keyof InferFont,
    | 'display'
    | 'format'
    | 'name'
    | 'prefer'
    | 'resourceHint'
    | 'stretch'
    | 'style'
    | 'tech'
    | 'testString'
    | 'weight'
  >
> = ['source', 'unicodeRange']

export const fontSlug = (value: InferFont, cwd: string): string => {
  const source = cryptoHash('sha1')
    .update(readFileSync(path.resolve(cwd, value.source)))
    .digest('hex')

  return createHash(pick({ ...value, source }, SLUG_PARTS))
}
