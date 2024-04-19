/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */

export class CharacterSet {
  data: Record<number, boolean> = {}
  size = 0

  constructor(input?: Array<[number, number] | number> | number | string) {
    if (typeof input === 'string') {
      for (let index = 0; index < input.length; index += 1) {
        const codePoint = input.charCodeAt(index)

        if ((codePoint & 0xf8_00) === 0xd8_00 && index < input.length) {
          const nextCodePoint = input.charCodeAt(index + 1)
          if ((nextCodePoint & 0xfc_00) === 0xdc_00) {
            this.add(
              ((codePoint & 0x3_ff) << 10) +
                (nextCodePoint & 0x3_ff) +
                0x1_00_00
            )
          } else {
            this.add(codePoint)
          }
          index += 1
        } else {
          this.add(codePoint)
        }
      }
    } else if (typeof input === 'number') {
      this.add(input)
    } else if (Array.isArray(input)) {
      const value = this.expandRange(input)

      for (let index = 0; index < value.length; index += 1) {
        this.add(value[index])
      }
    }
  }

  add(...arguments_: number[]) {
    for (let index = 0; index < arguments_.length; index += 1) {
      const codePoint = arguments_[index]

      if (!this.data[codePoint]) {
        this.data[codePoint] = true
        this.size += 1
      }
    }
  }

  compressRange(codePoints: number[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any[] = []

    for (let index = 0; index < codePoints.length; index += 1) {
      const previous = index > 0 ? codePoints[index - 1] : null
      const next = index < codePoints.length - 1 ? codePoints[index + 1] : null
      const current = codePoints[index]

      if (
        (current - 1 !== previous || previous === null) &&
        (current + 1 !== next || next === null)
      ) {
        result.push(current)
      } else if (
        (current - 1 !== previous || previous === null) &&
        (current + 1 === next || next === null)
      ) {
        result.push(current)
      } else if (
        (current - 1 === previous || previous === null) &&
        (current + 1 !== next || next === null)
      ) {
        // Don't bother collapsing the range if the range only consists of two adjacent code points
        if (current - result[result.length - 1] > 1) {
          result[result.length - 1] = [result[result.length - 1], current] as [
            number,
            number
          ]
        } else {
          result.push(current)
        }
      }
    }

    return result as Array<[number, number] | number>
  }

  expandRange(range: Array<[number, number] | number>) {
    const result: number[] = []

    for (let index = 0; index < range.length; index += 1) {
      const current = range[index]

      if (Array.isArray(current)) {
        for (let index = current[0]; index < current[1] + 1; index += 1) {
          result.push(index)
        }
      } else {
        result.push(current)
      }
    }

    return result
  }

  getSize() {
    return this.size
  }

  isEmpty() {
    return this.size === 0
  }

  toArray() {
    const result: number[] = []

    for (const codePoint in this.data) {
      if (
        // this.data.hasOwnProperty(codePoint) &&
        this.data[codePoint]
      ) {
        result.push(parseInt(codePoint, 10))
      }
    }

    result.sort(function (a, b) {
      return a - b
    })

    return result
  }

  toHexRangeString() {
    return this.toRange()
      .map(function (value) {
        return Array.isArray(value)
          ? 'U+' +
              value[0].toString(16).toUpperCase() +
              '-' +
              value[1].toString(16).toUpperCase()
          : 'U+' + value.toString(16).toUpperCase()
      })
      .join(',')
  }

  toRange() {
    return this.compressRange(this.toArray())
  }
}

export const fontUnicodeRange = (input: string): CharacterSet => {
  const ranges = input.split(/\s*,\s*/)
  const result = new CharacterSet()

  for (let index = 0; index < ranges.length; index++) {
    const match = /^(u\+([\d?a-f]{1,6})(?:-([\da-f]{1,6}))?)$/i.exec(
      ranges[index]
    )
    let start = null
    let end = null

    if (match != null) {
      if (match[2].includes('?')) {
        start = parseInt(match[2].replace('?', '0'), 16)
        end = parseInt(match[2].replace('?', 'f'), 16)
      } else {
        start = parseInt(match[2], 16)

        end = match[3] ? parseInt(match[3], 16) : start
      }

      if (start !== end) {
        for (let codePoint = start; codePoint <= end; codePoint++) {
          result.add(codePoint)
        }
      } else {
        result.add(start)
      }
    }
  }

  return result
}
