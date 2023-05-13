import fnv1a from '@sindresorhus/fnv1a'
import Hashids from 'hashids'
import stringify from 'safe-stable-stringify'
import { HASHS_LENGHT, HASH_ALPHABET } from '../constants'

export const createHash = (
  value: string | number | boolean | object | unknown[] | null
) =>
  new Hashids('', HASHS_LENGHT, HASH_ALPHABET).encodeHex(
    fnv1a(stringify(value), { size: 32 })
  )
