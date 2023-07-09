import { assert } from 'chai'
import path from 'path'
import { fileURLToPath } from 'url'
import { webFont } from './web-font'

const dirname = path.dirname(fileURLToPath(import.meta.url))

describe('src/web-font.spec.ts', function () {
  this.timeout(60000)

  it('happy-path', async () => {
    assert.isFunction(webFont)

    const result = await webFont({
      cwd: path.resolve(dirname, '../../test/happy-path')
    })

    assert.isObject(result)
  })
})
