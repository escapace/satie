export const quoteFontFamily = (string: string) =>
  [
    'serif',
    'sans-serif',
    'cursive',
    'fantasy',
    'monospace',
    'system-ui'
  ].includes(string)
    ? string
    : /[\s\d\W]+/gi.test(string)
    ? string.startsWith('"') && string.endsWith('"')
      ? string
      : `"${string}"`
    : string
