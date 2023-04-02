import { assert } from 'chai'
import { style } from './style'

describe('src/utilities/style.spec.ts', () => {
  it('.', () => {
    const string = style('.test', {
      display: ['flex', 'inline-flexx'],
      paddingTop: '3px',
      margin: 0,
      '@media': {
        'screen and (min-width: 768px)': {
          padding: 10,
          '@supports': {
            '(display: grid)': {
              display: 'grid'
            }
          }
        },
        '(prefers-reduced-motion)': {
          transitionProperty: 'color'
        }
      },
      '@supports': {
        '(display: grid)': {
          display: 'grid'
        }
      }
    })

    assert.isString(string)
  })
})
