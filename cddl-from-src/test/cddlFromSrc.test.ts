import * as fs from 'node:fs'
import {describe, expect, test} from 'vitest'
import {cddlFromSrc} from '../'
import wingridersLaunchpadNodeAst from './wingridersLaunchpadNode.ast.json'
import wingridersRequestV2Ast from './wingridersRequestV2.ast.json'

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
  test('Parses CDDL for LaunchpadNode', async () => {
    const cddlSchema = await fs.promises.readFile(
      `${__dirname}/wingridersLaunchpadNode.cddl`,
      'utf8',
    )
    const cddl = await cddlFromSrc(cddlSchema)
    expect(removeUndefinedFields(cddl)).toEqual(wingridersLaunchpadNodeAst)
  })

  test('Parses CDDL for WingridersRequestV2', async () => {
    const cddlSchema = await fs.promises.readFile(`${__dirname}/wingridersRequestV2.cddl`, 'utf8')
    const cddl = await cddlFromSrc(cddlSchema)
    expect(removeUndefinedFields(cddl)).toEqual(wingridersRequestV2Ast)
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
