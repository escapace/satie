import { assert } from 'chai'
import { toposort } from './toposort'

describe('toposort', () => {
  it('toposorts an empty graph', () => {
    assert.deepStrictEqual(toposort(new Map()), [])
  })

  it('toposorts a simple DAG', () => {
    assert.deepStrictEqual(
      toposort(
        new Map([
          ['a', ['b']],
          ['b', ['c']],
          ['c', []]
        ])
      ),
      [new Set(['a']), new Set(['b']), new Set(['c'])]
    )
  })

  it('toposorts a richer DAG', () => {
    assert.deepStrictEqual(
      toposort(
        new Map([
          ['a', ['c']],
          ['b', ['c']],
          ['c', []]
        ])
      ),
      [new Set(['a', 'b']), new Set(['c'])]
    )
  })

  it('toposorts a complex DAG', () => {
    assert.deepStrictEqual(
      toposort(
        new Map([
          ['a', ['c', 'f']],
          ['b', ['d', 'e']],
          ['c', ['f']],
          ['d', ['f', 'g']],
          ['e', ['h']],
          ['f', ['i']],
          ['g', ['j']],
          ['h', ['j']],
          ['i', []],
          ['j', []]
        ])
      ),
      [
        new Set(['a', 'b']),
        new Set(['c', 'd', 'e']),
        new Set(['f', 'g', 'h']),
        new Set(['i', 'j'])
      ]
    )
  })

  it('errors on a small cyclic graph', () => {
    const dg = new Map([
      ['a', ['b']],
      ['b', ['a']],
      ['c', []]
    ])

    const sortCyclicGraph = () => {
      toposort(dg)
    }

    assert.throws(sortCyclicGraph)
  })

  it('errors on a larger cyclic graph', () => {
    const dg = new Map([
      ['a', ['b', 'c']],
      ['b', ['c']],
      ['c', ['d', 'e']],
      ['d', ['b']],
      ['e', []]
    ])
    const sortCyclicGraph = () => {
      toposort(dg)
    }

    assert.throws(sortCyclicGraph)
  })
})

// describe('toposortReverse', () => {
//   it('can sort stuff', () => {
//     const graph = new Map([
//       ['floss', ['brushTeeth']],
//       ['drinkCoffee', ['wakeUp']],
//       ['wakeUp', []],
//       ['brushTeeth', ['drinkCoffee', 'eatBreakfast']],
//       ['eatBreakfast', ['wakeUp']]
//     ])
//
//     const result = toposortReverse(graph)
//
//     console.log(result)
//
//     // assert.deepStrictEqual(result).toMatchInlineSnapshot(`
//     //   Array [
//     //     Set {
//     //       "wakeUp",
//     //     },
//     //     Set {
//     //       "drinkCoffee",
//     //       "eatBreakfast",
//     //     },
//     //     Set {
//     //       "brushTeeth",
//     //     },
//     //     Set {
//     //       "floss",
//     //     },
//     //   ]
//     // `)
//   })
// })
