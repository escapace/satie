import { assert } from 'chai'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { satie } from './satie'

const dirname = path.dirname(fileURLToPath(import.meta.url))

describe('src/satie.spec.ts', function () {
  this.timeout(60_000)

  it('happy-path', async () => {
    assert.isFunction(satie)

    const result = await satie({
      cwd: path.resolve(dirname, '../../test/happy-path')
    })

    assert.isObject(result)
  })
})
