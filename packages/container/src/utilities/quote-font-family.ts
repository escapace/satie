/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
// export const quoteFontFamily = (string: string) =>
//   [
//     'serif',
//     'sans-serif',
//     'cursive',
//     'fantasy',
//     'monospace',
//     'system-ui'
//   ].includes(string)
//     ? string
//     : /[\s\d\W]+/gi.test(string)
//     ? string.startsWith('"') && string.endsWith('"')
//       ? string
//       : `"${string}"`
//     : string

export const quoteFontFamily = (name: string) => {
  const quotedMatch = name.match(/^['"](?<name>.*)['"]$/)
  if (quotedMatch != null && quotedMatch.groups?.name) {
    // Escape double quotes in middle of name
    return `"${quotedMatch.groups.name.split(`"`).join(`\"`)}"`
  }

  if (name.startsWith('"')) {
    // Complete double quotes if incomplete and escape double quotes in middle
    const [, ...restName] = name
    return `"${restName.map((x) => (x === `"` ? `\"` : x)).join('')}"`
  }

  if (!/^[a-zA-Z\d\-_]+$/.test(name)) {
    // Wrap in quotes if contains any characters that are not letters,
    // numbers, hyphens or underscores
    return `"${name.split(`"`).join(`\"`)}"`
  }

  return name
}
