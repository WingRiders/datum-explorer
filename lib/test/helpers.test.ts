import {describe, expect, it, vi} from 'vitest'
import {enrichError, limitedZip} from '../src/helpers'

describe('limitedZip', () => {
  it('zips arrays of the same length', () => {
    const arr1 = [1, 2, 3]
    const arr2 = ['a', 'b', 'c']
    const result = limitedZip(arr1, arr2)
    expect(result).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ])
  })

  it('zips arrays of different lengths (arr1 longer)', () => {
    const arr1 = [1, 2, 3, 4]
    const arr2 = ['a', 'b']
    const result = limitedZip(arr1, arr2)
    expect(result).toEqual([
      [1, 'a'],
      [2, 'b'],
    ])
  })

  it('zips arrays of different lengths (arr2 longer)', () => {
    const arr1 = [1, 2]
    const arr2 = ['a', 'b', 'c']
    const result = limitedZip(arr1, arr2)
    expect(result).toEqual([
      [1, 'a'],
      [2, 'b'],
    ])
  })

  it('returns an empty array if one of the arrays is empty', () => {
    const arr1 = [1, 2, 3]
    const arr2: string[] = []
    const result = limitedZip(arr1, arr2)
    expect(result).toEqual([])
  })

  it('returns an empty array if both arrays are empty', () => {
    const arr1: number[] = []
    const arr2: string[] = []
    const result = limitedZip(arr1, arr2)
    expect(result).toEqual([])
  })
})

describe('enrichError', () => {
  it('returns the result of the function if no error occurs', () => {
    const fn = vi.fn(() => 42)
    const result = enrichError(fn, 'Error occurred')
    expect(result).toBe(42)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('throws an error with the provided context if the function throws', () => {
    const fn = vi.fn(() => {
      throw new Error('Original error')
    })

    expect(() => enrichError(fn, 'Additional context')).toThrowError(
      expect.objectContaining({
        message: 'Additional context',
        cause: expect.objectContaining({
          message: 'Original error',
        }),
      }),
    )
  })
})
