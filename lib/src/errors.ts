import {betterTypeOf} from './helpers'

export class NotAHexStringError extends Error {
  override readonly message = 'CBOR is not a hex string'
}
export class MissingRootRuleError extends Error {
  override readonly message = 'Could not find root rule, there is no TypeRule in CDDL'
}
export class TypeChoicesAggregateError extends AggregateError {
  constructor(errors: Error[], typeChoicesLength: number) {
    super(errors, `Failed to parse cbor with any of the ${typeChoicesLength} type choices`)
  }
}
export class TheOnlyTypeChoiceError extends Error {
  constructor(type2Name: string, cause: Error) {
    super(`When parsing its only type choice ${type2Name}:`)
    this.cause = cause
  }
}

export class CDDLType2NotSupported extends Error {
  constructor(type2Name: string) {
    super(`CDDL Type2 not supported: ${type2Name}`)
  }
}

export class CDDLType2NotSupportedInMultiChoiceError extends Error {
  constructor(type2Name: string) {
    super(
      `CDDL Type2 ${type2Name} nested in multi-choice is not supported. Wrap it in a separate type.`,
    )
  }
}
export class CBORisNotMapError extends Error {
  constructor(cbor: unknown) {
    super(`CDDL expects Map, but CBOR is not a Map, but ${betterTypeOf(cbor)}`)
  }
}
export class TaggedDataWithMultipleChoicesNotSupportedError extends Error {
  constructor(typeChoicesLength: number, ruleName?: string) {
    if (ruleName)
      super(
        `Rule ${ruleName} has TaggedData with ${typeChoicesLength} type choices, which are not supported.`,
      )
    else super(`CDDL TaggedData with ${typeChoicesLength} type choices not supported`)
  }
}

export class TagMismatchError extends Error {
  constructor(cddlTag: number | undefined, cborTag: number) {
    super(`CDDL expects TaggedData with tag = ${cddlTag}, but CBOR is Tag with tag = ${cborTag}`)
  }
}

export class CBORisNotTagError extends Error {
  constructor(cbor: unknown) {
    super(`CDDL expects TaggedData, but CBOR is not a Tag, but ${betterTypeOf(cbor)}`)
  }
}
export class CBORisNotArrayError extends Error {
  constructor(cbor: unknown) {
    super(`CDDL expects Array, but cbor is ${betterTypeOf(cbor)}`)
  }
}
export class Only1GroupChoiceIsSupportedError extends Error {
  constructor(groupChoicesLength: number) {
    super(`CDDL contains ${groupChoicesLength} group choices. Only 1 group choice is supported`)
  }
}
export class UnsupportedGroupEntryError extends Error {
  constructor(groupEntry: string, ruleName?: string) {
    if (ruleName) super(`Rule ${ruleName} has unsupported groupEntry: ${groupEntry}`)
    else super(`Unsupported groupEntry: ${groupEntry}`)
  }
}
export class UnsupportedMemberKeyError extends Error {
  constructor(memberKey: string, ruleName?: string) {
    if (ruleName)
      super(
        `Rule ${ruleName} contains table with member key ${memberKey}. Only Type1 is supported.`,
      )
    else super(`Unsupported member key: ${memberKey}, only Type1 is supported`)
  }
}
export class CDDLTableWithNoMemberKeyError extends Error {
  constructor(ruleName?: string) {
    if (ruleName) super(`Rule ${ruleName} contains table with no member key.`)
    else super('CDDL table with no member key')
  }
}
export class NestedArraysNotSupportedError extends Error {
  override readonly message = 'Nested arrays are not supported. Wrap the inner array to a new type.'
}
export class ArrayLengthMismatchError extends Error {
  constructor(groupEntriesLength: number, cborLength: number) {
    super(
      `CDDL expects Array with length ${groupEntriesLength}, but cbor is an array with length ${cborLength}`,
    )
  }
}
export class NoOccurrenceSymbolError extends Error {
  constructor(structureName: string) {
    super(`CDDL ${structureName} contains no occurrence symbol`)
  }
}
export class Only1GroupEntrySupportedError extends Error {
  constructor(structureName: string, groupEntriesLength: number, ruleName?: string) {
    if (ruleName)
      super(
        `Rule ${ruleName} has ${structureName} with ${groupEntriesLength} group entries. Only 1 is supported.`,
      )
    else super(`CDDL ${structureName} has ${groupEntriesLength} group entries, only 1 is supported`)
  }
}
export class OnlyValueMemberKeyGroupEntrySupportedError extends Error {
  constructor(groupEntry: string, ruleName: string) {
    super(
      `Rule ${ruleName} has unsupported groupEntry ${groupEntry}. Only ValueMemberKey is supported.`,
    )
  }
}
export class OccurrenceError extends Error {
  constructor(
    structureName: string,
    metricName: string,
    actualOccurrence: number,
    violationMessage: string,
  ) {
    super(
      `${structureName} ${metricName} ${actualOccurrence} is ${violationMessage} defined by Occurrence`,
    )
  }
}
export class RuleNotFoundError extends Error {
  constructor(type: string, ruleName?: string) {
    if (ruleName) super(`Rule ${ruleName} refers to undefined type ${type}.`)
    else super(`Rule not found: ${type}`)
  }
}
export class NotATypeRuleError extends Error {
  constructor(ruleName: string) {
    super(`Typename ${ruleName} refers to rule, which is not a TypeRule`)
  }
}
export class CBORIsNotBufferError extends Error {
  constructor(cbor: unknown) {
    super(`CDDL expects Buffer, but cbor is ${betterTypeOf(cbor)}`)
  }
}
export class CBORIsNotNumberError extends Error {
  constructor(cbor: unknown) {
    super(`CDDL expects number, but cbor is ${betterTypeOf(cbor)}`)
  }
}
export class MissingMemberKeyError extends Error {
  override readonly message = 'Missing memberKey'
}

export class GenericParamsNotSupportedError extends Error {
  constructor(ruleName: string) {
    super(`Rule ${ruleName} has generic params, which are not supported.`)
  }
}

export class GenericArgsNotSupportedError extends Error {
  constructor(ruleName: string, type: string) {
    super(`Rule ${ruleName} refers to type ${type} with generic args, which are not supported.`)
  }
}

export class GroupRuleIsNotSupportedError extends Error {
  constructor(ruleName: string) {
    super(`Rule ${ruleName} is not a TypeRule. Only TypeRules are supported.`)
  }
}

export class CutNotSupportedError extends Error {
  constructor(ruleName: string) {
    super(`Rule ${ruleName} contains table with cut, which is not supported.`)
  }
}

export class StructWithUnnamedField extends Error {
  constructor(ruleName: string) {
    super(`Rule ${ruleName} has a struct with unnamed field.`)
  }
}
