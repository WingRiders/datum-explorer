import {Decoder, Tag, encode} from 'cbor-x'
import {cddlFromSrc} from '../'
import {enrichError, limitedZip} from './helpers'
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

type PrimitiveValue = number | string
type TypeWithValue = {
  type: string
  value: PrimitiveValue | TypeWithValue | NamedArray | GenericArray
}
type NamedArray = ({name: string} & TypeWithValue)[]
type GenericArray = (PrimitiveValue | TypeWithValue | NamedArray | GenericArray)[]

const isValidHexString = (hexString?: unknown): hexString is string =>
  typeof hexString === 'string' && !!hexString.match(/^([0-9a-fA-F]{2})*$/) /* hex encoded */

const getRuleName = (rule: Rule): string => {
  if ('Type' in rule) return rule.Type.rule.name.ident
  return rule.Group.rule.name.ident
}

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

const getMemberKeyName = (memberKey?: MemberKey): string | null => {
  if (!memberKey) return null
  if (!('Bareword' in memberKey)) return null
  return memberKey.Bareword.ident.ident
}

const getOccurrenceOfGroupEntry = (groupEntry: GroupEntry): Occurrence | undefined => {
  if ('ValueMemberKey' in groupEntry) return groupEntry.ValueMemberKey.ge.occur
  if ('TypeGroupname' in groupEntry) return groupEntry.TypeGroupname.ge.occur
  return groupEntry.InlineGroup.occur
}

const checkOccurrence = (
  {occur}: Occurrence,
  structure: {name: 'map'; cbor: Map<unknown, unknown>} | {name: 'array'; cbor: unknown[]},
): void => {
  const [metricName, actualOccurrence] =
    structure.name === 'map' ? ['size', structure.cbor.size] : ['length', structure.cbor.length]

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
  structure: {name: 'map'; cbor: Map<unknown, unknown>} | {name: 'array'; cbor: unknown[]},
): GroupEntry => {
  if (groupEntries.length !== 1)
    throw new Error(
      `CDDL generic ${structure.name} has ${groupEntries.length} group entries, only 1 is supported`,
    )
  const groupEntry = groupEntries[0]!
  const occurrence = getOccurrenceOfGroupEntry(groupEntry)
  if (occurrence == null) throw new Error(`Generic ${structure.name} contains no occurrence symbol`)
  checkOccurrence(occurrence, structure)
  return groupEntry
}

const parseGenericMap = (
  cddl: CDDL,
  groupEntries: GroupEntry[],
  cbor: Map<unknown, unknown>,
): TypeWithValue => {
  const groupEntry = checkGroupEntry(groupEntries, {name: 'map', cbor})
  if ('ValueMemberKey' in groupEntry) {
    const memberKey = groupEntry.ValueMemberKey.ge.member_key
    if (!memberKey) throw new Error('CDDL generic map with no member key')
    if ('Type1' in memberKey) {
      return {
        type: 'Map',
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
      `CDDL generic map unsupported member key ${Object.keys(memberKey)[0]!}, only Type1 is supported`,
    )
  }
  throw new Error(`Unsupported groupEntry in generic map: ${Object.keys(groupEntry)[0]!}`)
}

const parseGenericArray = (
  cddl: CDDL,
  groupEntries: GroupEntry[],
  cbor: unknown[],
): GenericArray => {
  const groupEntry = checkGroupEntry(groupEntries, {name: 'array', cbor})
  if ('ValueMemberKey' in groupEntry)
    return cbor.map((cborItem) =>
      parseTypeChoices(cddl, groupEntry.ValueMemberKey.ge.entry_type.type_choices, cborItem),
    )
  throw new Error(`Unsupported groupEntry in generic array: ${Object.keys(groupEntry)[0]!}`)
}

const parseArrayGroupEntries = (
  cddl: CDDL,
  groupEntries: GroupEntry[],
  cbor: unknown[],
): TypeWithValue | NamedArray | GenericArray => {
  if (groupEntries.length === 0) {
    if (cbor.length === 0) return []
    throw new Error(`CDDL expects empty array, but cbor is an array with length ${cbor.length}`)
  }
  if (groupEntries.some((groupEntry) => getOccurrenceOfGroupEntry(groupEntry) != null)) {
    return parseGenericArray(cddl, groupEntries, cbor)
  }
  if (groupEntries.length !== cbor.length)
    throw new Error(
      `CDDL expects Array with length ${groupEntries.length}, but cbor is an array with length ${cbor.length}`,
    )
  if (groupEntries.length === 1) {
    const groupEntry = groupEntries[0]!
    const cborItem = cbor[0]!
    if ('ValueMemberKey' in groupEntry) {
      const typeChoices = groupEntry.ValueMemberKey.ge.entry_type.type_choices
      if (typeChoices.length === 1)
        return parseType2AsSingleChoice(cddl, typeChoices[0]!.type1.type2, cborItem)
      return parseTypeChoices(cddl, typeChoices, cborItem) // Inline singleton arrays
    }
    if ('TypeGroupname' in groupEntry)
      return parseTypename(cddl, groupEntry.TypeGroupname.ge.name.ident, cbor)
    throw new Error(`Unsupported groupEntry: ${Object.keys(groupEntry)[0]!}`)
  }
  return limitedZip(groupEntries, cbor).map(([groupEntry, cborItem], index) => {
    if ('ValueMemberKey' in groupEntry) {
      const name = (
        getMemberKeyName(groupEntry.ValueMemberKey.ge.member_key) ??
        groupEntry.ValueMemberKey.trailing_comments?.join(',') ??
        groupEntry.ValueMemberKey.leading_comments?.join(',')
      )?.trim()
      if (name == null)
        throw new Error(
          `GroupEntry without name on index ${index}, while Array has ${groupEntries.length} items`,
        )
      return enrichError(() => {
        const typeWithValue = parseTypeChoices(
          cddl,
          groupEntry.ValueMemberKey.ge.entry_type.type_choices,
          cborItem,
        )
        if (Array.isArray(typeWithValue))
          throw new Error('Nested arrays are not supported, wrap the inner array to a new type')
        return {
          name,
          ...typeWithValue,
        }
      }, `Error parsing ValueMemberKey ${name}`)
    }
    if ('TypeGroupname' in groupEntry) {
      const name =
        groupEntry.TypeGroupname.trailing_comments?.join(',') ??
        groupEntry.TypeGroupname.leading_comments?.join(',')

      if (name == null)
        throw new Error(
          `GroupEntry without name on index ${index}, while Array has ${groupEntries.length} items`,
        )
      return {name, ...parseTypename(cddl, groupEntry.TypeGroupname.ge.name.ident, cbor)}
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

const parseType2AsSingleChoice = (
  cddl: CDDL,
  type2: Type2,
  cbor: unknown,
): TypeWithValue | NamedArray | GenericArray => {
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
    return parseGenericMap(cddl, groupEntries, cbor)
  }
  throw new Error(`CDDL Type2 not implemented: ${getType2Name(type2)}`)
}

const parseType2AsMultiChoice = (cddl: CDDL, type2: Type2, cbor: unknown): TypeWithValue => {
  if ('Typename' in type2) return parseTypename(cddl, type2.Typename.ident.ident, cbor)
  if ('TaggedData' in type2)
    throw new Error(
      'CDDL Type2 TaggedData nested in multi-choice is not supported. Wrap it in a separate type.',
    )
  if ('Array' in type2)
    throw new Error(
      'CDDL Type2 Array nested in multi-choice is not supported. Wrap it in a separate type.',
    )
  throw new Error(`CDDL Type2 not implemented: ${getType2Name(type2)}`)
}

const parseTypeChoices = (cddl: CDDL, typeChoices: TypeChoice[], cbor: unknown): TypeWithValue => {
  const errors: {msg: string; e: Error}[] = []
  for (const typeChoice of typeChoices) {
    try {
      return parseType2AsMultiChoice(cddl, typeChoice.type1.type2, cbor)
    } catch (e: unknown) {
      if (e instanceof Error)
        errors.push({msg: `${getType2Name(typeChoice.type1.type2)}: ${e.message}`, e})
      else throw e
    }
  }
  if (typeChoices.length === 1)
    throw new Error(`Failed to parse cbor with ${errors[0]!.msg}`, {cause: errors[0]!.e})
  throw new Error(
    `Failed to parse cbor with any of the type choices:\n${errors.map(({msg}) => msg).join('\n')}`,
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
    if (e instanceof Error)
      throw new Error(
        `Failed to parse cbor with TypeRule ${type} with ${typeChoices.length} type choices: ${e.message}`,
        {cause: e},
      )
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
  throw new Error('Could not find root rule, there is not TypeRule in CDDL')
}
