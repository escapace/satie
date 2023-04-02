import { assert } from 'chai'
import { quoteFontFamily } from './quote-font-family'

describe('src/utilities/quote-font-family.spec.ts', () => {
  it('.', () => {
    assert.equal(quoteFontFamily('sans-serif'), 'sans-serif')
    assert.equal(quoteFontFamily('noto'), 'noto')
    assert.equal(quoteFontFamily('noto sans'), '"noto sans"')
    assert.equal(quoteFontFamily('"noto sans"'), '"noto sans"')
  })
})
