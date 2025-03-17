import {repeat, zip} from 'lodash'

/**
 * Lodash's zip returns optional types because array can have different lengths.
 * This implementation takes minimum of the lengths of arrays and the items have non-optional types.
 */
export const limitedZip = <T, U>(arr1: T[], arr2: U[]): [T, U][] =>
  zip(arr1, arr2).filter(([t, u]) => t !== undefined && u !== undefined) as [T, U][]

export const enrichError = <T>(fn: () => T, context: string): T => {
  try {
    return fn()
  } catch (e: unknown) {
    throw new Error(context, {cause: e})
  }
}

const INDENT = 2

export const getAggregateMessage = (e: unknown, currentIndent = 0): string =>
  `${repeat(' ', currentIndent)}${e instanceof Error ? e.message : JSON.stringify(e)}${e instanceof AggregateError && e.errors.length > 0 ? `\n${e.errors.map((inner) => getAggregateMessage(inner, currentIndent + INDENT)).join('\n')}` : (e instanceof Error && e.cause) ? `\n${getAggregateMessage(e.cause, currentIndent + INDENT)}` : ''}`

export const betterTypeOf = (value: unknown): string => {
  if (value === null) return 'Null'
  if (value === undefined) return 'Undefined'
  const type = Object.prototype.toString.call(value).slice(8, -1)
  if (type === 'Object' && value.constructor) return value.constructor.name
  return type
}
