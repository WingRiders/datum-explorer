import {cddlFromSrc} from './cddlFromSrc'
import {
  getMemberKeyName,
  getOccurrenceOfGroupEntry,
  getRuleName,
  getType2Name,
  groupChoicesToGroupEntries,
  handleUnsupportedType2AsMultiChoice,
} from './common'
import {
  CDDLTableWithNoMemberKeyError,
  CDDLType2NotSupported,
  CutNotSupportedError,
  GenericArgsNotSupportedError,
  GenericParamsNotSupportedError,
  GroupRuleIsNotSupportedError,
  NestedArraysNotSupportedError,
  Only1GroupEntrySupportedError,
  OnlyValueMemberKeyGroupEntrySupportedError,
  RuleNotFoundError,
  StructWithUnnamedField,
  TaggedDataWithMultipleChoicesNotSupportedError,
  UnsupportedGroupEntryError,
  UnsupportedMemberKeyError,
} from './errors'
import {enrichError} from './helpers'
import type {GroupEntry, Type2, TypeChoice} from './types'

const isSupportedPrimitiveType = (type: string) => ['int', 'bytes', 'any'].includes(type)

const validateTypeName = (
  allRuleNames: string[],
  ruleName: string,
  type2: Extract<Type2, {Typename: any}>,
): void => {
  const type = type2.Typename.ident.ident
  if (type2.Typename.generic_args != null) throw new GenericArgsNotSupportedError(ruleName, type)
  if (!allRuleNames.includes(type) && !isSupportedPrimitiveType(type))
    throw new RuleNotFoundError(type, ruleName)
  return
}

const validateArray = (
  allRuleNames: string[],
  ruleName: string,
  groupEntries: GroupEntry[],
): void => {
  if (groupEntries.length !== 1)
    throw new Only1GroupEntrySupportedError('array', groupEntries.length, ruleName)
  const groupEntry = groupEntries[0]!
  if (!('ValueMemberKey' in groupEntry))
    throw new OnlyValueMemberKeyGroupEntrySupportedError(Object.keys(groupEntry)[0]!, ruleName)
  validateTypeChoices(allRuleNames, ruleName, groupEntry.ValueMemberKey.ge.entry_type.type_choices)
}

const validateSingletonArrayGroupEntry = (
  allRuleNames: string[],
  ruleName: string,
  groupEntry: GroupEntry,
): void => {
  if ('ValueMemberKey' in groupEntry) {
    const typeChoices = groupEntry.ValueMemberKey.ge.entry_type.type_choices
    if (typeChoices.length === 1) {
      validateType2AsSingleChoice(allRuleNames, ruleName, typeChoices[0]!.type1.type2)
      return
    }
    validateTypeChoices(allRuleNames, ruleName, typeChoices)
    return
  }
  throw new UnsupportedGroupEntryError(Object.keys(groupEntry)[0]!, ruleName)
}

const validateArrayGroupEntries = (
  allRuleNames: string[],
  ruleName: string,
  groupEntries: GroupEntry[],
): void => {
  if (groupEntries.some((groupEntry) => getOccurrenceOfGroupEntry(groupEntry) != null)) {
    validateArray(allRuleNames, ruleName, groupEntries)
    return
  }
  if (groupEntries.length === 1) {
    validateSingletonArrayGroupEntry(allRuleNames, ruleName, groupEntries[0]!)
    return
  }
  groupEntries.forEach((groupEntry, index) => {
    if (!('ValueMemberKey' in groupEntry))
      throw new OnlyValueMemberKeyGroupEntrySupportedError(Object.keys(groupEntry)[0]!, ruleName)
    const name = enrichError(
      () => getMemberKeyName(groupEntry.ValueMemberKey.ge.member_key).trim(),
      `Rule ${ruleName} has invalid ValueMemberKey on index ${index}, while Array has ${groupEntries.length} items`,
    )
    if (!name) throw new StructWithUnnamedField(ruleName)
    enrichError(() => {
      validateTypeChoices(
        allRuleNames,
        ruleName,
        groupEntry.ValueMemberKey.ge.entry_type.type_choices,
        true,
      )
    }, `Rule ${ruleName} has invalid ValueMemberKey "${name}":`)
  })
}

const validateType2AsSingleChoice = (
  allRuleNames: string[],
  ruleName: string,
  type2: Type2,
  isInsideArray = false,
): void => {
  if ('Typename' in type2) {
    validateTypeName(allRuleNames, ruleName, type2)
    return
  }
  if ('Array' in type2) {
    if (isInsideArray) throw new NestedArraysNotSupportedError()
    const groupEntries = groupChoicesToGroupEntries(type2.Array.group.group_choices)
    validateArrayGroupEntries(allRuleNames, ruleName, groupEntries)
    return
  }
  if ('TaggedData' in type2) {
    const typeChoices = type2.TaggedData.t.type_choices
    if (typeChoices.length !== 1)
      throw new TaggedDataWithMultipleChoicesNotSupportedError(typeChoices.length, ruleName)
    validateType2AsSingleChoice(allRuleNames, ruleName, typeChoices[0]!.type1.type2)
    return
  }
  if ('Map' in type2) {
    const groupEntries = groupChoicesToGroupEntries(type2.Map.group.group_choices)
    if (groupEntries.length !== 1)
      throw new Only1GroupEntrySupportedError('table', groupEntries.length, ruleName)
    const groupEntry = groupEntries[0]!
    if (!('ValueMemberKey' in groupEntry))
      throw new UnsupportedGroupEntryError(Object.keys(groupEntry)[0]!, ruleName)
    const memberKey = groupEntry.ValueMemberKey.ge.member_key
    if (!memberKey) throw new CDDLTableWithNoMemberKeyError(ruleName)
    if (!('Type1' in memberKey))
      throw new UnsupportedMemberKeyError(Object.keys(memberKey)[0]!, ruleName)
    if (memberKey.Type1.is_cut) throw new CutNotSupportedError(ruleName)
    validateType2AsSingleChoice(allRuleNames, ruleName, memberKey.Type1.t1.type2)
    validateTypeChoices(
      allRuleNames,
      ruleName,
      groupEntry.ValueMemberKey.ge.entry_type.type_choices,
    )
    return
  }
  throw new CDDLType2NotSupported(getType2Name(type2))
}

const validateType2AsMultiChoice = (
  allRuleNames: string[],
  ruleName: string,
  type2: Type2,
): void => {
  if ('Typename' in type2) {
    validateTypeName(allRuleNames, ruleName, type2)
    return
  }
  handleUnsupportedType2AsMultiChoice(type2)
}

const validateTypeChoices = (
  allRuleNames: string[],
  ruleName: string,
  typeChoices: TypeChoice[],
  isInsideArray = false,
): void => {
  if (typeChoices.length === 1) {
    validateType2AsSingleChoice(allRuleNames, ruleName, typeChoices[0]!.type1.type2, isInsideArray)
    return
  }
  for (const typeChoice of typeChoices) {
    validateType2AsMultiChoice(allRuleNames, ruleName, typeChoice.type1.type2)
  }
}

export const validateCddl = async (cddlSchemaRaw: string) => {
  const cddl = await cddlFromSrc(cddlSchemaRaw)
  const allRuleNames = cddl.rules.map(getRuleName)
  for (const rule of cddl.rules) {
    if (!('Type' in rule)) throw new GroupRuleIsNotSupportedError(rule.Group.rule.name.ident)
    const ruleName = rule.Type.rule.name.ident
    if (rule.Type.rule.generic_params != null) throw new GenericParamsNotSupportedError(ruleName)
    validateTypeChoices(allRuleNames, ruleName, rule.Type.rule.value.type_choices)
  }
}
