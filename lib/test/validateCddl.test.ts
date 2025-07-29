import {describe, expect, test} from 'bun:test'
import fs from 'node:fs'
import {getAggregateMessage, validateCddl} from '../src'
import {fixtures} from './fixtures/validateCddl'

describe('validateCddl', () => {
  test.each(fixtures)('Validates CDDL for $name', async ({cddlFileName, expectedErrorMessage}) => {
    const cddlSchema = await fs.promises.readFile(
      `${__dirname}/fixtures/cddl/${cddlFileName}`,
      'utf8',
    )
    if (expectedErrorMessage != null) {
      try {
        await validateCddl(cddlSchema)
      } catch (e) {
        // Array is thrown by cddl crate
        if (Array.isArray(e))
          return expect(e.map((item) => item.msg?.short).join(', ')).toEqual(expectedErrorMessage)
        if (e instanceof Error) return expect(getAggregateMessage(e)).toEqual(expectedErrorMessage)
        throw e
      }
    } else {
      let result: Awaited<ReturnType<typeof validateCddl>>
      try {
        result = await validateCddl(cddlSchema)
      } catch (e) {
        throw new Error(
          `CDDL schema validation failed for ${cddlFileName}: ${getAggregateMessage(e)}`,
        )
      }
      expect(result).toBeUndefined()
    }
  })
})
