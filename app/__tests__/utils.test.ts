import { notEmpty, sortUnits } from '../screens/shared/utils'

describe('utils', () => {
  test('notEmpty', () => {
    const allNotEmpty = ['one', 'two', 'three', 'a', 'b']
    const notAllEmpty = ['hello', '', 'world']
    expect(notEmpty(...allNotEmpty)).toBe(true)
    expect(notEmpty(...notAllEmpty)).toBe(false)
  })

  test('sortUnits', () => {
    const u1 = { label: 'A' }
    const u2 = { label: 'Ba' }
    const u3 = { label: 'bb' }
    const u4 = { label: 'C' }

    const units = [u2, u4, u3, u1] as Unit[]

    let result = sortUnits(units)

    expect(result).toEqual([u1, u2, u3, u4])
  })
})
