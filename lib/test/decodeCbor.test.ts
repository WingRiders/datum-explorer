import {describe, expect, it} from 'bun:test'
import {Tag} from 'cbor-x'
import {decodeCbor} from '../src/decodeCbor'
import {NotAHexStringError} from '../src/errors'

const cborCases = [
  {input: '00', expected: {success: true, value: 0}}, // Smallest valid CBOR (integer 0)
  {input: '01', expected: {success: true, value: 1}}, // Integer 1
  {input: '0a', expected: {success: true, value: 10}}, // Integer 10
  {input: 'f5', expected: {success: true, value: true}}, // Boolean true
  {input: 'f4', expected: {success: true, value: false}}, // Boolean false
  {input: 'f6', expected: {success: true, value: null}}, // Null value
  {input: 'd88000', expected: {success: true, value: new Tag(0, 128)}}, // Tag 128 with Integer 0
  {input: '5800', expected: {success: true, value: Buffer.from('')}}, // Empty bytes
  {input: '5802cafe', expected: {success: true, value: Buffer.from('cafe', 'hex')}}, // Bytes
  {input: '80', expected: {success: true, value: []}}, // Empty array
  {input: '83010203', expected: {success: true, value: [1, 2, 3]}}, // Array with numbers

  {input: 'xyz', expected: {success: false, error: NotAHexStringError}}, // Non-hex string
  {input: '123', expected: {success: false, error: NotAHexStringError}}, // Odd-length hex string
  {input: '', expected: {success: false, error: 'Unexpected end of CBOR data'}}, // Empty string
  {input: '8200', expected: {success: false, error: 'Unexpected end of CBOR data'}}, // Incomplete structure
]

describe('decodeCbor', () => {
  cborCases.forEach(({input, expected}) => {
    it(`decodes CBOR: ${input}`, () => {
      if (expected.success) {
        expect(decodeCbor(input)).toEqual(expected.value)
      } else {
        expect(() => decodeCbor(input)).toThrow(expected.error)
      }
    })
  })
})
