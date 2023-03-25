import { transform } from 'lightningcss'

export const minifyCss = (value: string) => {
  const { code } = transform({
    filename: 'style.css',
    code: Buffer.from(value),
    minify: true
  })

  return code.toString('utf8')
}
