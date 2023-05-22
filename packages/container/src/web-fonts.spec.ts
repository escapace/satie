import { assert } from 'chai'
import path from 'path'
import { fileURLToPath } from 'url'
import { webFonts } from './web-fonts'

const dirname = path.dirname(fileURLToPath(import.meta.url))

describe('src/web-fonts.spec.ts', function () {
  this.timeout(60000)

  it('happy-path', async () => {
    assert.isFunction(webFonts)

    const result = await webFonts({
      cwd: path.resolve(dirname, '../../test/happy-path')
    })

    assert.isObject(result)
  })
})
