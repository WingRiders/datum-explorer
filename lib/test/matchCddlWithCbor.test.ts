import fs from 'node:fs'
import {describe, expect, test} from 'vitest'
import {matchCddlWithCbor} from '../'
import {getAggregateMessage} from '../src/helpers'
import {fixtures} from './fixtures/parseCbor'

describe('matchCddlWithCbor', () => {
  test.each(fixtures)('Matches CBOR with $name', async ({cddlFileName, cbor, expectedParsed}) => {
    const cddlSchema = await fs.promises.readFile(
      `${__dirname}/fixtures/cddl/${cddlFileName}`,
      'utf8',
    )
    try {
      const parsed = await matchCddlWithCbor(cddlSchema, cbor)
      expect(parsed).toEqual(expectedParsed)
    } catch (e) {
      throw new Error(getAggregateMessage(e))
    }
  })
})
