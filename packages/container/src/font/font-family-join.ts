import { quoteFontFamily } from '../utilities/quote-font-family'

export const fontFamilyJoin = (value: string[] = []) =>
  value.length === 0
    ? undefined
    : value.map((value) => quoteFontFamily(value)).join(', ')
