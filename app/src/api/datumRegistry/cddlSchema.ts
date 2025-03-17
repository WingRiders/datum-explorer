import {cddlFromSrc} from '@wingriders/datum-explorer-lib'
import {CDDLDecodingError} from './errors'

export const getRootTypeName = async (cddl: string) => {
  try {
    const {rules} = await cddlFromSrc(cddl)
    for (const rule of rules) {
      if ('Type' in rule) {
        // First TypeRule is the root
        return rule.Type.rule.name.ident
      }
    }
  } catch (e) {
    throw new CDDLDecodingError(e instanceof Error ? e.message : String(e))
  }
  // should never happen
  throw new CDDLDecodingError('No root rule found')
}
