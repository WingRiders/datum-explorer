import {
  CDDLType2NotSupported,
  CDDLType2NotSupportedInMultiChoiceError,
  MissingMemberKeyError,
  Only1GroupChoiceIsSupportedError,
  UnsupportedMemberKeyError,
} from './errors'
import type {GroupChoice, GroupEntry, MemberKey, Occurrence, Rule, Type2} from './types'

/**
 * Common CDDL-related methods for both CBOR parsing and CDDL validation
 * @param rule
 */

export const getRuleName = (rule: Rule): string =>
  ('Type' in rule ? rule.Type : rule.Group).rule.name.ident

// Each type in the Type2 union has exactly 1 key
export const getType2Name = (type2: Type2) => Object.keys(type2)[0]!

export const handleUnsupportedType2AsMultiChoice = (
  type2: Exclude<Type2, {Typename: any}>,
): never => {
  const type2Name = getType2Name(type2)
  if (['TaggedData', 'Array', 'Map'].includes(type2Name)) {
    throw new CDDLType2NotSupportedInMultiChoiceError(type2Name)
  }
  throw new CDDLType2NotSupported(getType2Name(type2))
}

export const groupChoicesToGroupEntries = (groupChoices: GroupChoice[]): GroupEntry[] => {
  if (groupChoices.length !== 1) throw new Only1GroupChoiceIsSupportedError(groupChoices.length)
  return groupChoices[0]!.group_entries.map(([groupEntry, _optionalComma]) => groupEntry)
}

export const getOccurrenceOfGroupEntry = (groupEntry: GroupEntry): Occurrence | undefined => {
  if ('ValueMemberKey' in groupEntry) return groupEntry.ValueMemberKey.ge.occur
  if ('TypeGroupname' in groupEntry) return groupEntry.TypeGroupname.ge.occur
  return groupEntry.InlineGroup.occur
}

export const getMemberKeyName = (memberKey?: MemberKey): string => {
  if (!memberKey) throw new MissingMemberKeyError()
  if (!('Bareword' in memberKey)) throw new UnsupportedMemberKeyError(Object.keys(memberKey)[0]!)
  return memberKey.Bareword.ident.ident
}
