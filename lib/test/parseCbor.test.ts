import fs from 'node:fs'
import {describe, expect, test} from 'vitest'
import {getAggregateMessage} from '../src/helpers'
import {parseCbor} from '../src/parseCbor'
import {fixtures} from './fixtures/parseCbor'

describe('parseCbor', () => {
  test.each(fixtures)('Parses CBOR for $name', async ({cddlFileName, cbor, expectedParsed}) => {
    const cddlSchema = await fs.promises.readFile(
      `${__dirname}/fixtures/cddl/${cddlFileName}`,
      'utf8',
    )
    try {
      const parsed = await parseCbor(cddlSchema, cbor)
      expect(parsed).toEqual(expectedParsed)
    } catch (e) {
      throw new Error(getAggregateMessage(e))
    }
  })
})
