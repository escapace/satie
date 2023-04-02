import { compact } from 'lodash-es'
import { TypeFont, TypeInferFont } from '../types'

export const describeFont = (value: TypeFont | TypeInferFont): string =>
  compact([
    `family '${value.family}'`,
    value.weight === undefined
      ? undefined
      : `weight '${value.weight.toString()}'`,
    value.stretch === undefined
      ? undefined
      : `stretch '${value.stretch.toString()}'`,
    value.style === undefined ? undefined : `style '${value.style.toString()}'`
  ]).join(', ')
