export function fontFamilyToCamelCase(str: string) {
  return str
    .split(/[\s|-]/)
    .filter(Boolean)
    .map(
      (s, i) =>
        `${s.charAt(0)[i > 0 ? 'toUpperCase' : 'toLowerCase']()}${s.slice(1)}`
    )
    .join('')
}
