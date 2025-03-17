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
    super(`When parsing its only type choice ${type2Name}:`, cause)
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
  override readonly message = 'CDDL TaggedData with multiple type choices not supported'
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
  constructor(groupEntry: string) {
    super(`Unsupported groupEntry: ${groupEntry}`)
  }
}
export class UnsupportedMemberKeyError extends Error {
  constructor(memberKey: string) {
    super(`Unsupported member key: ${memberKey}, only Type1 is supported`)
  }
}
export class CDDLTableWithNoMemberKeyError extends Error {
  override readonly message = 'CDDL table with no member key'
}
export class NestedArraysNotSupportedError extends Error {
  override readonly message = 'Nested arrays are not supported. Wrap the inner array to a new type'
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
  constructor(structureName: string, groupEntriesLength: number) {
    super(`CDDL ${structureName} has ${groupEntriesLength} group entries, only 1 is supported`)
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
  constructor(ruleName: string) {
    super(`Rule not found: ${ruleName}`)
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
