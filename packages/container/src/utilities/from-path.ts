export const fromPath = (
  array: Array<number | string>,
  quote: '"' | "'" = "'",
  forceQuote = false
) => {
  const regexp = new RegExp('(\\\\|' + quote + ')', 'g') // regex => /(\\|')/g

  return array
    .map(function (value, key) {
      let property = value.toString()
      if (!forceQuote && /^[A-z]\w*$/.exec(property) != null) {
        // str with only A-z0-9_ chars will display `foo.bar`
        return key !== 0 ? '.' + property : property
      } else if (!forceQuote && /^\d+$/.exec(property) != null) {
        // str with only numbers will display `foo[0]`
        return '[' + property + ']'
      } else {
        property = property.replace(regexp, '\\$1')
        return '[' + quote + property + quote + ']'
      }
    })
    .join('')
}
