import * as fs from 'node:fs'
import {describe, expect, test} from 'vitest'
import {cddlFromSrc} from '../'
import {fixtures} from './fixtures/cddlFromSrc'

const removeUndefinedFields = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedFields)
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, removeUndefinedFields(value)]),
    )
  }
  return obj
}

describe('cddlFromSrc', () => {
  test.each(fixtures)('Parses CDDL for $name', async ({cddlFileName, expectedAst}) => {
    const cddlSchema = await fs.promises.readFile(
      `${__dirname}/fixtures/cddl/${cddlFileName}`,
      'utf8',
    )
    const cddl = await cddlFromSrc(cddlSchema)
    expect(removeUndefinedFields(cddl)).toEqual(expectedAst)
  })

  test('Throws error for empty CDDL', async () => {
    // Error: [{"position":{"line":1,"column":1,"range":[0,0],"index":0},"msg":{"short":"you must have at least one rule defined"}}]
    await expect(cddlFromSrc('')).rejects.toThrowError()
  })

  test('Throws error for invalid rule', async () => {
    // Error: [{"position":{"line":1,"column":0,"range":[4,5],"index":4},"msg":{"short":"missing definition for rule a"}}]
    await expect(cddlFromSrc('a = a')).rejects.toThrowError()
  })
})
