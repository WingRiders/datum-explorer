import {zip} from 'lodash'

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
