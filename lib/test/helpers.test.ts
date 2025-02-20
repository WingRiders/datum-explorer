import {describe, expect, it, mock} from 'bun:test'
import {betterTypeOf, enrichError, limitedZip} from '../src/helpers'

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
    const fn = mock(() => 42)
    const result = enrichError(fn, 'Error occurred')
    expect(result).toBe(42)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('throws an error with the provided context if the function throws', () => {
    const fn = mock(() => {
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

describe('betterTypeOf', () => {
  it('should return "Array" for arrays', () => {
    expect(betterTypeOf([])).toBe('Array')
    expect(betterTypeOf([1, 2, 3])).toBe('Array')
  })

  it('should return "Object" for plain objects', () => {
    expect(betterTypeOf({})).toBe('Object')
    expect(betterTypeOf({key: 'value'})).toBe('Object')
  })

  it('should return "Null" for null', () => {
    expect(betterTypeOf(null)).toBe('Null')
  })

  it('should return "Undefined" for undefined', () => {
    expect(betterTypeOf(undefined)).toBe('Undefined')
  })

  it('should return "Number" for numbers', () => {
    expect(betterTypeOf(42)).toBe('Number')
    expect(betterTypeOf(-3.14)).toBe('Number')
    expect(betterTypeOf(Number.NaN)).toBe('Number')
    expect(betterTypeOf(Number.POSITIVE_INFINITY)).toBe('Number')
  })

  it('should return "String" for strings', () => {
    expect(betterTypeOf('hello')).toBe('String')
    expect(betterTypeOf('')).toBe('String')
  })

  it('should return "Boolean" for booleans', () => {
    expect(betterTypeOf(true)).toBe('Boolean')
    expect(betterTypeOf(false)).toBe('Boolean')
  })

  it('should return "BigInt" for bigints', () => {
    expect(betterTypeOf(BigInt(42))).toBe('BigInt')
    expect(betterTypeOf(9007199254740991n)).toBe('BigInt')
  })

  it('should return "Symbol" for symbols', () => {
    expect(betterTypeOf(Symbol('test'))).toBe('Symbol')
  })

  it('should return "Function" for functions', () => {
    expect(betterTypeOf(() => {})).toBe('Function')
    expect(betterTypeOf(function test() {})).toBe('Function')
    expect(betterTypeOf(class {})).toBe('Function')
  })

  it('should return "Date" for Date objects', () => {
    expect(betterTypeOf(new Date())).toBe('Date')
  })

  it('should return "RegExp" for regular expressions', () => {
    expect(betterTypeOf(/regex/)).toBe('RegExp')
  })

  it('should return "Map" for Map objects', () => {
    expect(betterTypeOf(new Map())).toBe('Map')
  })

  it('should return "Set" for Set objects', () => {
    expect(betterTypeOf(new Set())).toBe('Set')
  })

  it('should return "WeakMap" for WeakMap objects', () => {
    expect(betterTypeOf(new WeakMap())).toBe('WeakMap')
  })

  it('should return "WeakSet" for WeakSet objects', () => {
    expect(betterTypeOf(new WeakSet())).toBe('WeakSet')
  })

  it('should return "Error" for Error objects', () => {
    expect(betterTypeOf(new Error('test error'))).toBe('Error')
  })

  it('should return "Promise" for Promises', () => {
    expect(betterTypeOf(Promise.resolve())).toBe('Promise')
  })

  it('should return "ArrayBuffer" for ArrayBuffer', () => {
    expect(betterTypeOf(new ArrayBuffer(10))).toBe('ArrayBuffer')
  })

  it('should return "Uint8Array" for Uint8Array', () => {
    expect(betterTypeOf(new Uint8Array())).toBe('Uint8Array')
  })

  it('should return "Int32Array" for Int32Array', () => {
    expect(betterTypeOf(new Int32Array())).toBe('Int32Array')
  })

  it('should return "CustomClass" for instances of custom classes', () => {
    class CustomClass {}
    expect(betterTypeOf(new CustomClass())).toBe('CustomClass')
  })
})
