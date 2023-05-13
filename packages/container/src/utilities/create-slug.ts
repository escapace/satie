import { pick, values } from 'lodash-es'
import { SLUG_PARTS } from '../constants'
import { TypeFont, TypeInferFont } from '../types'
import { createHash } from './create-hash'

export const createSlug = (value: TypeFont | TypeInferFont): string => {
  if (value.name !== undefined) {
    return value.name
  }

  const v = values(pick(value, ...SLUG_PARTS)).flatMap((value) => value)

  return createHash(v)
}
