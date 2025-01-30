import {Decoder, Tag, encode} from 'cbor-x'
import {cddlFromSrc} from './cddlFromSrc'
import {enrichError, limitedZip} from './helpers'
import type {GenericArray, PrimitiveValue, TypeWithValue, Value} from './readableDatumTypes'
import type {
  CDDL,
  GroupChoice,
  GroupEntry,
  MemberKey,
  Occurrence,
  Rule,
  Type2,
  TypeChoice,
  TypeRule,
} from './types'

const isValidHexString = (hexString?: unknown): hexString is string =>
  typeof hexString === 'string' && !!hexString.match(/^([0-9a-fA-F]{2})*$/) /* hex encoded */

const getRuleName = (rule: Rule): string =>
  ('Type' in rule ? rule.Type : rule.Group).rule.name.ident

// Each type in the Type2 union has exactly 1 key
const getType2Name = (type2: Type2) => Object.keys(type2)[0]!

const parsePrimitiveType = (typeName: string, cbor: unknown): PrimitiveValue | null => {
  if (typeName === 'int') {
    if (typeof cbor === 'number') return Number(cbor)
    if (typeof cbor === 'bigint') return BigInt(cbor).toString()
    throw new Error(`CDDL expects number, but cbor is ${typeof cbor}`)
  }
  if (typeName === 'bytes') {
    if (Buffer.isBuffer(cbor)) return cbor.toString('hex')
    throw new Error(`CDDL expects Buffer, but cbor is ${typeof cbor}`)
  }
  if (typeName === 'any') {
    return encode(cbor).toString('hex')
  }
  return null
}

const parseTypename = (cddl: CDDL, type: string, cbor: unknown): TypeWithValue => {
  const value = parsePrimitiveType(type, cbor)
  if (value != null) return {type, value}
  for (const rule of cddl.rules) {
    if (getRuleName(rule) === type) {
      if ('Type' in rule) return parseTypeRule(cddl, rule.Type.rule, cbor)
      throw new Error(`Typename ${type} refers to rule, which is not a TypeRule`)
    }
  }
  throw new Error(`Rule not found: ${type}`)
}

const getMemberKeyName = (memberKey?: MemberKey): string => {
  if (!memberKey) throw new Error('Missing memberKey')
  if (!('Bareword' in memberKey))
    throw new Error(`Unsupported memberKey ${Object.keys(memberKey)[0]!}`)
  return memberKey.Bareword.ident.ident
}

const getOccurrenceOfGroupEntry = (groupEntry: GroupEntry): Occurrence | undefined => {
  if ('ValueMemberKey' in groupEntry) return groupEntry.ValueMemberKey.ge.occur
  if ('TypeGroupname' in groupEntry) return groupEntry.TypeGroupname.ge.occur
  return groupEntry.InlineGroup.occur
}

const checkOccurrence = (
  {occur}: Occurrence,
  structure: {name: 'table'; cbor: Map<unknown, unknown>} | {name: 'array'; cbor: unknown[]},
): void => {
  const [metricName, actualOccurrence] =
    structure.name === 'table' ? ['size', structure.cbor.size] : ['length', structure.cbor.length]

  if (occur.Exact?.lower && actualOccurrence < occur.Exact.lower)
    throw new Error(
      `${structure.name} ${metricName} ${actualOccurrence} is less than lower bound ${occur.Exact.lower} defined by Occurrence`,
    )
  if (occur.Exact?.upper && actualOccurrence > occur.Exact.upper)
    throw new Error(
      `${structure.name} ${metricName} ${actualOccurrence} is greater than upper bound ${occur.Exact.upper} defined by Occurrence`,
    )
  if (occur.OneOrMore && actualOccurrence < 1)
    throw new Error(
      `${structure.name} ${metricName} ${actualOccurrence} is less than OneOrMore defined by Occurrence`,
    )
  if (occur.Optional && actualOccurrence > 1)
    throw new Error(
      `${structure.name} ${metricName} ${actualOccurrence} is more than Optional defined by Occurrence`,
    )
}

const checkGroupEntry = (
  groupEntries: GroupEntry[],
  structure: {name: 'table'; cbor: Map<unknown, unknown>} | {name: 'array'; cbor: unknown[]},
): GroupEntry => {
  if (groupEntries.length !== 1)
    throw new Error(
      `CDDL ${structure.name} has ${groupEntries.length} group entries, only 1 is supported`,
    )
  const groupEntry = groupEntries[0]!
  const occurrence = getOccurrenceOfGroupEntry(groupEntry)
  if (occurrence == null) throw new Error(`CDDL ${structure.name} contains no occurrence symbol`)
  checkOccurrence(occurrence, structure)
  return groupEntry
}

// https://www.rfc-editor.org/rfc/rfc8610.html#section-3.5.2
const parseTable = (
  cddl: CDDL,
  groupEntries: GroupEntry[],
  cbor: Map<unknown, unknown>,
): TypeWithValue => {
  const groupEntry = checkGroupEntry(groupEntries, {name: 'table', cbor})
  if ('ValueMemberKey' in groupEntry) {
    const memberKey = groupEntry.ValueMemberKey.ge.member_key
    if (!memberKey) throw new Error('CDDL table with no member key')
    if ('Type1' in memberKey) {
      return {
        type: 'Table',
        value: [...cbor.entries()].map(([cborKey, cborValue]) => {
          const mapEntryAsGenericArray: GenericArray = [
            parseType2AsSingleChoice(cddl, memberKey.Type1.t1.type2, cborKey),
            parseTypeChoices(cddl, groupEntry.ValueMemberKey.ge.entry_type.type_choices, cborValue),
          ]
          return mapEntryAsGenericArray
        }),
      }
    }
    throw new Error(
      `Unsupported member key in CDDL table: ${Object.keys(memberKey)[0]!}, only Type1 is supported`,
    )
  }
  throw new Error(
    `Unsupported groupEntry in CDDL table: ${Object.keys(groupEntry)[0]!}, only ValueMemberKey is supported`,
  )
}

// https://www.rfc-editor.org/rfc/rfc8610.html#section-3.4
const parseArray = (cddl: CDDL, groupEntries: GroupEntry[], cbor: unknown[]): GenericArray => {
  const groupEntry = checkGroupEntry(groupEntries, {name: 'array', cbor})
  if ('ValueMemberKey' in groupEntry)
    return cbor.map((cborItem) =>
      parseTypeChoices(cddl, groupEntry.ValueMemberKey.ge.entry_type.type_choices, cborItem),
    )
  throw new Error(
    `Unsupported groupEntry in CDDL array: ${Object.keys(groupEntry)[0]!}, only ValueMemberKey is supported`,
  )
}

const parseSingletonArrayGroupEntry = (
  cddl: CDDL,
  groupEntry: GroupEntry,
  cbor: unknown,
): Value => {
  if ('ValueMemberKey' in groupEntry) {
    const typeChoices = groupEntry.ValueMemberKey.ge.entry_type.type_choices
    if (typeChoices.length === 1)
      return parseType2AsSingleChoice(cddl, typeChoices[0]!.type1.type2, cbor)
    return parseTypeChoices(cddl, typeChoices, cbor)
  }
  if ('TypeGroupname' in groupEntry)
    return parseTypename(cddl, groupEntry.TypeGroupname.ge.name.ident, cbor)
  throw new Error(`Unsupported groupEntry: ${Object.keys(groupEntry)[0]!}`)
}

const parseArrayGroupEntries = (cddl: CDDL, groupEntries: GroupEntry[], cbor: unknown[]): Value => {
  if (groupEntries.length === 0) {
    if (cbor.length === 0) return []
    throw new Error(`CDDL expects empty array, but cbor is an array with length ${cbor.length}`)
  }
  if (groupEntries.some((groupEntry) => getOccurrenceOfGroupEntry(groupEntry) != null)) {
    return parseArray(cddl, groupEntries, cbor)
  }
  if (groupEntries.length !== cbor.length)
    throw new Error(
      `CDDL expects Array with length ${groupEntries.length}, but cbor is an array with length ${cbor.length}`,
    )
  // Inline singleton arrays
  if (groupEntries.length === 1)
    return parseSingletonArrayGroupEntry(cddl, groupEntries[0]!, cbor[0]!)
  return limitedZip(groupEntries, cbor).map(([groupEntry, cborItem], index) => {
    if ('ValueMemberKey' in groupEntry) {
      const name = enrichError(
        () => getMemberKeyName(groupEntry.ValueMemberKey.ge.member_key)?.trim(),
        `Error parsing ValueMemberKey on index ${index}, while Array has ${groupEntries.length} items`,
      )
      return enrichError(() => {
        const typeWithValue = parseTypeChoices(
          cddl,
          groupEntry.ValueMemberKey.ge.entry_type.type_choices,
          cborItem,
        )
        if (Array.isArray(typeWithValue))
          throw new Error('Nested arrays are not supported. Wrap the inner array to a new type')
        return {
          name,
          ...typeWithValue,
        }
      }, `When parsing ValueMemberKey "${name}":`)
    }
    throw new Error(`Unsupported groupEntry: ${Object.keys(groupEntry)[0]!}`)
  })
}

const groupChoicesToGroupEntries = (groupChoices: GroupChoice[]): GroupEntry[] => {
  if (groupChoices.length !== 1)
    throw new Error(
      `CDDL contains ${groupChoices.length} group choices. Only 1 group choice is supported`,
    )
  return groupChoices[0]!.group_entries.map(([groupEntry, _optionalComma]) => groupEntry)
}

const parseType2AsSingleChoice = (cddl: CDDL, type2: Type2, cbor: unknown): Value => {
  if ('Array' in type2) {
    const groupEntries = groupChoicesToGroupEntries(type2.Array.group.group_choices)
    if (typeof cbor !== 'object' || !Array.isArray(cbor))
      throw new Error(`CDDL expects Array, but cbor is ${typeof cbor} (not Array)`)
    return parseArrayGroupEntries(cddl, groupEntries, cbor)
  }
  if ('TaggedData' in type2) {
    if (!(cbor instanceof Tag))
      throw new Error(`CDDL expects TaggedData, but CBOR is not a Tag, but ${typeof cbor}`)
    if (type2.TaggedData.tag !== cbor.tag)
      throw new Error(
        `CDDL expects TaggedData with tag = ${type2.TaggedData.tag}, but CBOR is Tag with tag = ${cbor.tag}`,
      )
    const typeChoices = type2.TaggedData.t.type_choices
    if (typeChoices.length === 1)
      return parseType2AsSingleChoice(cddl, typeChoices[0]!.type1.type2, cbor.value)
    throw new Error('CDDL TaggedData with multiple type choices not supported')
  }
  if ('Typename' in type2) return parseTypename(cddl, type2.Typename.ident.ident, cbor)
  if ('Map' in type2) {
    const groupEntries = groupChoicesToGroupEntries(type2.Map.group.group_choices)
    if (!(cbor instanceof Map))
      throw new Error(`CDDL expects Map, but CBOR is not a Map, but ${typeof cbor}`)
    return parseTable(cddl, groupEntries, cbor)
  }
  throw new Error(`CDDL Type2 not implemented: ${getType2Name(type2)}`)
}

const parseType2AsMultiChoice = (cddl: CDDL, type2: Type2, cbor: unknown): TypeWithValue => {
  if ('Typename' in type2) return parseTypename(cddl, type2.Typename.ident.ident, cbor)
  const type2Name = getType2Name(type2)
  if (['TaggedData', 'Array', 'Map'].includes(type2Name))
    throw new Error(
      `CDDL Type2 ${type2Name} nested in multi-choice is not supported. Wrap it in a separate type.`,
    )
  throw new Error(`CDDL Type2 not implemented: ${getType2Name(type2)}`)
}

const parseTypeChoices = (cddl: CDDL, typeChoices: TypeChoice[], cbor: unknown): TypeWithValue => {
  const errors: {typeName: string; e: Error}[] = []
  for (const typeChoice of typeChoices) {
    try {
      return parseType2AsMultiChoice(cddl, typeChoice.type1.type2, cbor)
    } catch (e: unknown) {
      if (e instanceof Error) errors.push({typeName: getType2Name(typeChoice.type1.type2), e})
      else throw e
    }
  }
  if (typeChoices.length === 1)
    throw new Error(`When parsing its only type choice ${errors[0]!.typeName}`, {
      cause: errors[0]!.e,
    })
  throw new AggregateError(
    errors.map(({e}) => e),
    `Failed to parse cbor with any of the ${typeChoices.length} type choices`,
  )
}

const parseTypeRule = (cddl: CDDL, typeRule: TypeRule, cbor: unknown): TypeWithValue => {
  const type = typeRule.name.ident
  const typeChoices = typeRule.value.type_choices
  try {
    if (typeChoices.length === 1)
      return {type, value: parseType2AsSingleChoice(cddl, typeChoices[0]!.type1.type2, cbor)}
    return parseTypeChoices(cddl, typeRule.value.type_choices, cbor)
  } catch (e: unknown) {
    if (e instanceof Error) throw new Error(`When parsing TypeRule "${type}":`, {cause: e})
    throw e
  }
}

export const parseCbor = async (cddlSchemaRaw: string, cborString: string) => {
  if (!isValidHexString(cborString)) throw new Error('CBOR is not a hex string')
  const cddl = await cddlFromSrc(cddlSchemaRaw)
  const decoder = new Decoder({mapsAsObjects: false})
  const cbor: unknown = decoder.decode(Buffer.from(cborString, 'hex'))
  for (const rule of cddl.rules) {
    if ('Type' in rule) {
      // First TypeRule is the root
      return parseTypeRule(cddl, rule.Type.rule, cbor)
    }
  }
  throw new Error('Could not find root rule, there is no TypeRule in CDDL')
}
