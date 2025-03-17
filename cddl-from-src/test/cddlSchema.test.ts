import {describe, expect, test} from 'bun:test'
import {cddlSchema} from '../src'
import launchpadNodeAst from './launchpad_node.ast.json'

describe('cddlSchema', () => {
  test('throws error for invalid CDDL', () => {
    expect(() => cddlSchema.parse(null)).toThrowError()
    expect(() => cddlSchema.parse(undefined)).toThrowError()
    expect(() => cddlSchema.parse({})).toThrowError()
    expect(() => cddlSchema.parse({rules: null})).toThrowError()
  })

  test('does not throw for a valid CDDL', async () => {
    expect(() => cddlSchema.parse({rules: []})).not.toThrowError()
    expect(() => cddlSchema.parse(launchpadNodeAst)).not.toThrowError()
  })
})
