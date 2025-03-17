import fs from 'node:fs'
import {describe, expect, test} from 'vitest'
import {validateCddl} from '../src'
import {getAggregateMessage} from '../src/helpers'
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
      await expect(validateCddl(cddlSchema)).resolves.toBeUndefined()
    }
  })
})
