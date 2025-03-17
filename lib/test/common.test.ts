import {describe, expect, test} from 'bun:test'
import type {GroupChoice, GroupEntry, MemberKey, Occurrence, Rule, Span, Type, Type2} from '../src'
import {
  getMemberKeyName,
  getOccurrenceOfGroupEntry,
  getRuleName,
  getType2Name,
  groupChoicesToGroupEntries,
  handleUnsupportedType2AsMultiChoice,
} from '../src/common'
import {
  CDDLType2NotSupported,
  CDDLType2NotSupportedInMultiChoiceError,
  MissingMemberKeyError,
  Only1GroupChoiceIsSupportedError,
  UnsupportedMemberKeyError,
} from '../src/errors'

const span: Span = [0, 0, 0]

const value: Type = {type_choices: [], span}

const entry: GroupEntry = {ValueMemberKey: {ge: {entry_type: value}, span}}

describe('getRuleName', () => {
  test('returns the rule name for a Type rule', () => {
    const rule: Rule = {
      Type: {rule: {name: {ident: 'MyRule', span}, is_type_choice_alternate: false, value}, span},
    }
    expect(getRuleName(rule)).toBe('MyRule')
  })

  test('returns the rule name for a Group rule', () => {
    const rule: Rule = {
      Group: {
        rule: {name: {ident: 'MyGroupRule', span}, is_type_choice_alternate: false, entry},
        span,
      },
    }
    expect(getRuleName(rule)).toBe('MyGroupRule')
  })
})

describe('getType2Name', () => {
  test('returns the key of the Type2 object', () => {
    const type2: Type2 = {Typename: {ident: {ident: '', span}, span}}
    expect(getType2Name(type2)).toBe('Typename')
  })
})

describe('handleUnsupportedType2AsMultiChoice', () => {
  test('throws error for unsupported Type2 in multi-choice', () => {
    const type2: Exclude<Type2, {Typename: any}> = {TaggedData: {t: value, span}}
    expect(() => handleUnsupportedType2AsMultiChoice(type2)).toThrow(
      CDDLType2NotSupportedInMultiChoiceError,
    )
  })

  test('throws error for unimplemented Type2', () => {
    const type2: Exclude<Type2, {Typename: any}> = {IntValue: {value: 0, span}}
    expect(() => handleUnsupportedType2AsMultiChoice(type2)).toThrow(CDDLType2NotSupported)
  })
})

describe('groupChoicesToGroupEntries', () => {
  test('throws error if groupChoices length is not 1', () => {
    const groupChoices: GroupChoice[] = [{group_entries: []}, {group_entries: []}] as any
    expect(() => groupChoicesToGroupEntries(groupChoices)).toThrow(Only1GroupChoiceIsSupportedError)
  })

  test('returns group entries for a single group choice', () => {
    const groupEntry: GroupEntry = {
      ValueMemberKey: {ge: {entry_type: value}, span},
    }
    const groupChoices: GroupChoice[] = [{group_entries: [[groupEntry, {optional_comma: false}]]}]
    expect(groupChoicesToGroupEntries(groupChoices)).toEqual([groupEntry])
  })
})

describe('getOccurrenceOfGroupEntry', () => {
  const occur: Occurrence = {occur: {Exact: {lower: 1, upper: 1, span}}}
  test('returns occurrence for ValueMemberKey group entry', () => {
    const groupEntry: GroupEntry = {
      ValueMemberKey: {ge: {entry_type: value, occur}, span},
    }
    expect(getOccurrenceOfGroupEntry(groupEntry)).toBe(occur)
  })

  test('returns occurrence for TypeGroupname group entry', () => {
    const groupEntry: GroupEntry = {
      TypeGroupname: {ge: {occur, name: {ident: '', span}}, span},
    }
    expect(getOccurrenceOfGroupEntry(groupEntry)).toBe(occur)
  })

  test('returns occurrence for InlineGroup group entry', () => {
    const groupEntry: GroupEntry = {
      InlineGroup: {occur, group: {group_choices: [], span}, span},
    }
    expect(getOccurrenceOfGroupEntry(groupEntry)).toBe(occur)
  })
})

describe('getMemberKeyName', () => {
  test('throws error if memberKey is missing', () => {
    expect(() => getMemberKeyName(undefined)).toThrow(MissingMemberKeyError)
  })

  test('throws error for unsupported memberKey type', () => {
    const memberKey: MemberKey = {UnsupportedKey: {}} as any
    expect(() => getMemberKeyName(memberKey)).toThrow(UnsupportedMemberKeyError)
  })

  test('returns Bareword identifier for supported memberKey', () => {
    const memberKey: MemberKey = {Bareword: {ident: {ident: 'keyName'}}} as any
    expect(getMemberKeyName(memberKey)).toBe('keyName')
  })
})
