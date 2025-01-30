import fs from 'node:fs'
import {describe, expect, test} from 'vitest'
import {parseCbor} from '../src/parseCbor'
import {fixtures} from './fixtures/parseCbor'

describe('parseCbor', () => {
  test.each(fixtures)('Parses CBOR for $name', async ({cddlFileName, cbor, expectedParsed}) => {
    const cddlSchema = await fs.promises.readFile(
      `${__dirname}/fixtures/cddl/${cddlFileName}`,
      'utf8',
    )
    expect(await parseCbor(cddlSchema, cbor)).toEqual(expectedParsed)
  })
})
