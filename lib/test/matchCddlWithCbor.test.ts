import fs from 'node:fs'
import {describe, expect, it, test} from 'vitest'
import {matchCddlWithCbor} from '../src'
import {getAggregateMessage} from '../src/helpers'
import {fixtures} from './fixtures/matchCddlWithCbor'

const readCddlSchema = (cddlFileName: string) =>
  fs.promises.readFile(`${__dirname}/fixtures/cddl/${cddlFileName}`, 'utf8')

const checkCDDLParsingError = async (
  cddlSchema: string,
  expectedMessage: string,
  expectedCause: unknown,
) => {
  try {
    await matchCddlWithCbor(cddlSchema, '00')
  } catch (e: unknown) {
    if (!(e instanceof Error)) throw new Error('Expected an instance of Error')
    expect(e.message).toEqual(expectedMessage)
    expect(e.cause).toEqual(expectedCause)
    return
  }
  throw new Error('Expected an error to be thrown')
}

const checkCborMatchingError = async (
  cddlFileName: string,
  cbor: string,
  expectedMessageFileName: string,
) => {
  const cddlSchema = await readCddlSchema(cddlFileName)
  const expectedMessage = await fs.promises.readFile(
    `${__dirname}/fixtures/matchCddlWithCbor/errorMessages/${expectedMessageFileName}`,
    'utf8',
  )

  try {
    await matchCddlWithCbor(cddlSchema, cbor)
  } catch (e: unknown) {
    expect(getAggregateMessage(e)).toEqual(expectedMessage.trim())
    return
  }
  throw new Error('Expected an error to be thrown')
}

describe('matchCddlWithCbor', () => {
  test.each(fixtures)('Matches CBOR with $name', async ({cddlFileName, cbor, expectedParsed}) => {
    const cddlSchema = await readCddlSchema(cddlFileName)
    try {
      const parsed = await matchCddlWithCbor(cddlSchema, cbor)
      expect(parsed).toEqual(expectedParsed)
    } catch (e) {
      throw new Error(getAggregateMessage(e))
    }
  })

  it('throws error when no rule', async () => {
    const expectedCause = [
      {
        msg: {short: 'you must have at least one rule defined'},
        position: {column: 1, index: 0, line: 1, range: [0, 0]},
      },
    ]
    await checkCDDLParsingError('', 'CDDL parsing error', expectedCause)
  })

  it('throws error for rule with no assignment', async () => {
    const expectedCause = [
      {
        msg: {short: "expected assignment token '=', '/=' or '//=' after rule identifier"},
        position: {column: 1, index: 0, line: 1, range: [0, 4]},
      },
    ]
    await checkCDDLParsingError('rule', 'CDDL parsing error', expectedCause)
  })

  it('throws error for rule with invalid assignment', async () => {
    const expectedCause = [
      {
        msg: {short: 'invalid group entry syntax'},
        position: {column: 1, index: 0, line: 1, range: [5, 6]},
      },
    ]
    await checkCDDLParsingError('rule =', 'CDDL parsing error', expectedCause)
  })

  it('throws error when rule not found', async () => {
    const expectedCause = [
      {
        msg: {short: 'missing definition for rule rule2'},
        position: {column: 0, index: 7, line: 1, range: [7, 12]},
      },
    ]
    await checkCDDLParsingError('rule = rule2', 'CDDL parsing error', expectedCause)
  })

  it('throws error when array mismatches int', () =>
    checkCborMatchingError('int.cddl', '80', 'arrayMismatchesInt.txt'))

  it('throws error when array mismatches bytes', () =>
    checkCborMatchingError('bytes.cddl', '80', 'arrayMismatchesBytes.txt'))

  it('throws error when int mismatches bytes', () =>
    checkCborMatchingError('bytes.cddl', '00', 'intMismatchesBytes.txt'))

  it('throws error when int mismatches TaggedData', () =>
    checkCborMatchingError('wingridersLaunchpadNode.cddl', '00', 'intMismatchesTaggedData.txt'))

  it('throws error when tag mismatches', () =>
    checkCborMatchingError('wingridersLaunchpadNode.cddl', 'd88000', 'tagMismatch.txt'))

  it('throws error when int mismatches array', () =>
    checkCborMatchingError('wingridersLaunchpadNode.cddl', 'd87900', 'intMismatchesArray.txt'))

  it('throws error when array length mismatches', () =>
    checkCborMatchingError('wingridersLaunchpadNode.cddl', 'd87980', 'arrayLengthMismatches.txt'))

  it('throws error when multiple type choices mismatch', () =>
    checkCborMatchingError(
      'wingridersLaunchpadNode.cddl',
      'd8798400000000',
      'multipleTypeChoicesMismatch.txt',
    ))
})
