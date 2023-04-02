import { transform } from 'lightningcss'
import { forEach } from 'lodash-es'
import { StyleRule, LightningCSSTargets } from '../types'

function dashify(str: string) {
  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/^ms-/, '-ms-')
    .toLowerCase()
}

const DOUBLE_SPACE = '  '

function iterate(v: StyleRule, indent = '', prefix = '') {
  const rules: string[] = []

  forEach(v, (value, key) => {
    if (Array.isArray(value)) {
      rules.push(...value.map((v) => iterate({ [key]: v }, indent)))
    } else if (typeof value === 'object') {
      const isEmpty = Object.keys(value).length === 0

      if (!isEmpty) {
        if (key === '@supports' || key === '@media') {
          rules.push(iterate(value, indent + DOUBLE_SPACE, `${key} `))
        } else {
          rules.push(
            `${indent}${prefix}${key} {\n${iterate(
              value,
              indent + DOUBLE_SPACE,
              prefix
            )}\n${indent}}`
          )
        }
      }
    } else if (typeof value === 'string' || typeof value === 'number') {
      rules.push(
        `${indent}${key.startsWith('--') ? key : dashify(key)}: ${value};`
      )
    }
  })

  return rules.join('\n')
}

export const style = (
  selector: string,
  rule: StyleRule,
  targets?: LightningCSSTargets
) => {
  const css = `${selector} {
${iterate(rule, '  ')}
}`

  const { code } = transform({
    targets,
    filename: 'style.css',
    code: Buffer.from(css),
    minify: false,
    drafts: {
      nesting: true
    }
  })

  return code.toString('utf8')
}
