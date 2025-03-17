import {Tag, encode} from 'cbor-x'
import {
  getMemberKeyName,
  getOccurrenceOfGroupEntry,
  getRuleName,
  getType2Name,
  groupChoicesToGroupEntries,
  handleUnsupportedType2AsMultiChoice,
} from './common'
import {
  ArrayLengthMismatchError,
  CBORIsNotBufferError,
  CBORIsNotNumberError,
  CBORisNotArrayError,
  CBORisNotMapError,
  CBORisNotTagError,
  CDDLTableWithNoMemberKeyError,
  CDDLType2NotSupported,
  MissingRootRuleError,
  NestedArraysNotSupportedError,
  NoOccurrenceSymbolError,
  NotATypeRuleError,
  OccurrenceError,
  Only1GroupEntrySupportedError,
  RuleNotFoundError,
  TagMismatchError,
  TaggedDataWithMultipleChoicesNotSupportedError,
  TheOnlyTypeChoiceError,
  TypeChoicesAggregateError,
  UnsupportedGroupEntryError,
  UnsupportedMemberKeyError,
} from './errors'
import {enrichError, limitedZip} from './helpers'
import type {DatumValue, GenericArray, PrimitiveValue, ReadableDatum} from './readableDatumTypes'
import type {CddlAst, GroupEntry, Occurrence, Type2, TypeChoice, TypeRule} from './types'

enum PrimitiveType {
  INT = 'int',
  BYTES = 'bytes',
  ANY = 'any',
}

const matchPrimitiveType = (typeName: string, cbor: unknown): PrimitiveValue | null => {
  if (typeName === PrimitiveType.INT) {
    if (typeof cbor === 'number') return Number(cbor)
    if (typeof cbor === 'bigint') return BigInt(cbor).toString()
    throw new CBORIsNotNumberError(cbor)
  }
  if (typeName === PrimitiveType.BYTES) {
    if (Buffer.isBuffer(cbor)) return cbor.toString('hex')
    throw new CBORIsNotBufferError(cbor)
  }
  if (typeName === PrimitiveType.ANY) {
    return encode(cbor).toString('hex')
  }
  return null
}

const parseTypename = (cddl: CddlAst, type: string, cbor: unknown): ReadableDatum => {
  const value = matchPrimitiveType(type, cbor)
  if (value != null) return {type, value}
  for (const rule of cddl.rules) {
    if (getRuleName(rule) === type) {
      if ('Type' in rule) return matchTypeRule(cddl, rule.Type.rule, cbor)
      throw new NotATypeRuleError(type)
    }
  }
  throw new RuleNotFoundError(type)
}

const checkOccurrence = (
  {occur}: Occurrence,
  structure: {name: 'table'; cbor: Map<unknown, unknown>} | {name: 'array'; cbor: unknown[]},
): void => {
  const [metricName, actualOccurrence] =
    structure.name === 'table' ? ['size', structure.cbor.size] : ['length', structure.cbor.length]

  if ('Exact' in occur && occur.Exact.lower && actualOccurrence < occur.Exact.lower)
    throw new OccurrenceError(
      structure.name,
      metricName,
      actualOccurrence,
      `less than lower bound ${occur.Exact.lower}`,
    )
  if ('Exact' in occur && occur.Exact.upper && actualOccurrence > occur.Exact.upper)
    throw new OccurrenceError(
      structure.name,
      metricName,
      actualOccurrence,
      `more than upper bound ${occur.Exact.upper}`,
    )
  if ('OneOrMore' in occur && occur.OneOrMore && actualOccurrence < 1)
    throw new OccurrenceError(structure.name, metricName, actualOccurrence, 'less than OneOrMore')
  if ('Optional' in occur && occur.Optional && actualOccurrence > 1)
    throw new OccurrenceError(structure.name, metricName, actualOccurrence, 'more than Optional')
}

const checkGroupEntry = (
  groupEntries: GroupEntry[],
  structure: {name: 'table'; cbor: Map<unknown, unknown>} | {name: 'array'; cbor: unknown[]},
): GroupEntry => {
  if (groupEntries.length !== 1)
    throw new Only1GroupEntrySupportedError(structure.name, groupEntries.length)
  const groupEntry = groupEntries[0]!
  const occurrence = getOccurrenceOfGroupEntry(groupEntry)
  if (occurrence == null) throw new NoOccurrenceSymbolError(structure.name)
  checkOccurrence(occurrence, structure)
  return groupEntry
}

// https://www.rfc-editor.org/rfc/rfc8610.html#section-3.5.2
const matchTable = (
  cddl: CddlAst,
  groupEntries: GroupEntry[],
  cbor: Map<unknown, unknown>,
): ReadableDatum => {
  const groupEntry = checkGroupEntry(groupEntries, {name: 'table', cbor})
  if ('ValueMemberKey' in groupEntry) {
    const memberKey = groupEntry.ValueMemberKey.ge.member_key
    if (!memberKey) throw new CDDLTableWithNoMemberKeyError()
    if ('Type1' in memberKey) {
      return {
        type: 'Table',
        value: [...cbor.entries()].map(([cborKey, cborValue]) => {
          const mapEntryAsGenericArray: GenericArray = [
            matchType2AsSingleChoice(cddl, memberKey.Type1.t1.type2, cborKey),
            matchTypeChoices(cddl, groupEntry.ValueMemberKey.ge.entry_type.type_choices, cborValue),
          ]
          return mapEntryAsGenericArray
        }),
      }
    }
    throw new UnsupportedMemberKeyError(Object.keys(memberKey)[0]!)
  }
  throw new UnsupportedGroupEntryError(Object.keys(groupEntry)[0]!)
}

// https://www.rfc-editor.org/rfc/rfc8610.html#section-3.4
const matchArray = (cddl: CddlAst, groupEntries: GroupEntry[], cbor: unknown[]): GenericArray => {
  const groupEntry = checkGroupEntry(groupEntries, {name: 'array', cbor})
  if ('ValueMemberKey' in groupEntry)
    return cbor.map((cborItem) =>
      matchTypeChoices(cddl, groupEntry.ValueMemberKey.ge.entry_type.type_choices, cborItem),
    )
  throw new UnsupportedGroupEntryError(Object.keys(groupEntry)[0]!)
}

const matchSingletonArrayGroupEntry = (
  cddl: CddlAst,
  groupEntry: GroupEntry,
  cbor: unknown,
): DatumValue => {
  if ('ValueMemberKey' in groupEntry) {
    const typeChoices = groupEntry.ValueMemberKey.ge.entry_type.type_choices
    if (typeChoices.length === 1)
      return matchType2AsSingleChoice(cddl, typeChoices[0]!.type1.type2, cbor)
    return matchTypeChoices(cddl, typeChoices, cbor)
  }
  throw new UnsupportedGroupEntryError(Object.keys(groupEntry)[0]!)
}

const matchArrayGroupEntries = (
  cddl: CddlAst,
  groupEntries: GroupEntry[],
  cbor: unknown[],
): DatumValue => {
  if (groupEntries.some((groupEntry) => getOccurrenceOfGroupEntry(groupEntry) != null)) {
    return matchArray(cddl, groupEntries, cbor)
  }
  if (groupEntries.length !== cbor.length)
    throw new ArrayLengthMismatchError(groupEntries.length, cbor.length)
  // Inline singleton arrays
  if (groupEntries.length === 1)
    return matchSingletonArrayGroupEntry(cddl, groupEntries[0]!, cbor[0]!)
  return limitedZip(groupEntries, cbor).map(([groupEntry, cborItem], index) => {
    if ('ValueMemberKey' in groupEntry) {
      const name = enrichError(
        () => getMemberKeyName(groupEntry.ValueMemberKey.ge.member_key)?.trim(),
        `Error parsing ValueMemberKey on index ${index}, while Array has ${groupEntries.length} items`,
      )
      return enrichError(() => {
        const typeWithValue = matchTypeChoices(
          cddl,
          groupEntry.ValueMemberKey.ge.entry_type.type_choices,
          cborItem,
        )
        if (Array.isArray(typeWithValue)) throw new NestedArraysNotSupportedError()
        return {
          name,
          ...typeWithValue,
        }
      }, `When parsing ValueMemberKey "${name}":`)
    }
    throw new UnsupportedGroupEntryError(Object.keys(groupEntry)[0]!)
  })
}

const matchType2AsSingleChoice = (cddl: CddlAst, type2: Type2, cbor: unknown): DatumValue => {
  if ('Array' in type2) {
    const groupEntries = groupChoicesToGroupEntries(type2.Array.group.group_choices)
    if (!Array.isArray(cbor)) throw new CBORisNotArrayError(cbor)
    return matchArrayGroupEntries(cddl, groupEntries, cbor)
  }
  if ('TaggedData' in type2) {
    if (!(cbor instanceof Tag)) throw new CBORisNotTagError(cbor)
    if (type2.TaggedData.tag !== cbor.tag)
      throw new TagMismatchError(type2.TaggedData.tag, cbor.tag)
    const typeChoices = type2.TaggedData.t.type_choices
    if (typeChoices.length === 1)
      return matchType2AsSingleChoice(cddl, typeChoices[0]!.type1.type2, cbor.value)
    throw new TaggedDataWithMultipleChoicesNotSupportedError(typeChoices.length)
  }
  if ('Typename' in type2) return parseTypename(cddl, type2.Typename.ident.ident, cbor)
  if ('Map' in type2) {
    const groupEntries = groupChoicesToGroupEntries(type2.Map.group.group_choices)
    if (!(cbor instanceof Map)) throw new CBORisNotMapError(cbor)
    return matchTable(cddl, groupEntries, cbor)
  }
  throw new CDDLType2NotSupported(getType2Name(type2))
}

const matchType2AsMultiChoice = (cddl: CddlAst, type2: Type2, cbor: unknown): ReadableDatum => {
  if ('Typename' in type2) return parseTypename(cddl, type2.Typename.ident.ident, cbor)
  return handleUnsupportedType2AsMultiChoice(type2)
}

const matchTypeChoices = (
  cddl: CddlAst,
  typeChoices: TypeChoice[],
  cbor: unknown,
): ReadableDatum => {
  const errors: Error[] = []
  for (const typeChoice of typeChoices) {
    try {
      return matchType2AsMultiChoice(cddl, typeChoice.type1.type2, cbor)
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (typeChoices.length === 1)
          throw new TheOnlyTypeChoiceError(getType2Name(typeChoice.type1.type2), e)
        errors.push(e)
      } else throw e
    }
  }
  throw new TypeChoicesAggregateError(errors, typeChoices.length)
}

const matchTypeRule = (cddl: CddlAst, typeRule: TypeRule, cbor: unknown): ReadableDatum => {
  const type = typeRule.name.ident
  const typeChoices = typeRule.value.type_choices
  return enrichError(() => {
    if (typeChoices.length === 1)
      return {type, value: matchType2AsSingleChoice(cddl, typeChoices[0]!.type1.type2, cbor)}
    return matchTypeChoices(cddl, typeRule.value.type_choices, cbor)
  }, `When parsing TypeRule "${type}":`)
}

export const matchCddlWithCbor = async (cddl: CddlAst, cbor: unknown) => {
  for (const rule of cddl.rules) {
    if ('Type' in rule) {
      // First TypeRule is the root
      return matchTypeRule(cddl, rule.Type.rule, cbor)
    }
  }
  throw new MissingRootRuleError()
}
