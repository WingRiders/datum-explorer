# CDDL datum schema design document

This document outlines the design of the schema language used for defining datums. The language is inspired by Concise Data Definition Language (CDDL) but is adapted for ease of use, readability, and compatibility with our tools. This document also highlights supported and unsupported features of CDDL in our implementation.

## Overview of schema language

The schema language is primarily designed to:

- Define the structure of datums in a concise and human-readable format.
- Serve as a blueprint for parsing and validating CBOR data into a structured JavaScript object.
- Allow for future extensibility without sacrificing readability or performance.

The schema is parsed into an internal representation, which is then used to validate and convert CBOR data.

## Key goals

- **Readability**: The schema should be easy to read and understand for developers.
- **Simplicity**: Avoid unnecessary complexity by limiting supported features to those with clear use cases.
- **Extensibility**: Allow for future support of additional CDDL features as needed.

## Supported features

The following CDDL features are supported in our implementation:

### Primitive types

- [**int**](https://www.rfc-editor.org/rfc/rfc8610.html#section-3.3): Integer values, including numbers and bigints.
- [**bytes**](https://www.rfc-editor.org/rfc/rfc8610.html#section-3.3): Byte strings, represented as hexadecimal strings.
- **any**: Arbitrary CBOR data, encoded as a hexadecimal string. This type can also be used as a placeholder for unsupported features, until they are implemented.

### Named rules

[Rules](https://www.rfc-editor.org/rfc/rfc8610.html#section-3.1) are defined with a name, followed by an equals sign "=" and the actual definition according to the respective syntactic rules of that definition.

### Type choices

[Type Choices](https://www.rfc-editor.org/rfc/rfc8610.html#section-2.2.2) are supported:

```
TypeChoice = int / bytes
```

### Tagged data

[Tagged Data](https://www.rfc-editor.org/rfc/rfc8610.html#section-3.6) are supported:

```
TaggedData = #6.121(bytes)
```

### Comments

[Comments](https://www.rfc-editor.org/rfc/rfc8610.html#section-3.1) are started by a ";" (semicolon) character and finish at the end of a line (LF or CRLF). They are supported and ignored by Datum Explorer.

### Arrays

[Array](https://www.rfc-editor.org/rfc/rfc8610.html#section-3.4) definitions surround a group with square brackets. Datum Explorer supports arrays with the following constraints:

- Singleton array used to inline the inner data / avoid giving it an explicit name, e.g. `[ int ]`.
- Generic arrays with [occurrence](https://www.rfc-editor.org/rfc/rfc8610.html#section-3.2) constraint, e.g., `[ * int ]`, are supported. However, only one group entry is allowed to ensure the array remains uniform.

### Structs

[Structs](https://www.rfc-editor.org/rfc/rfc8610.html#section-3.5.1) are fixed-length arrays with explicit name for each element, e.g.

```
[ transactionId : bytes
, outputIndex   : int
]
```

The [occurrence indicators](https://www.rfc-editor.org/rfc/rfc8610.html#section-3.2) are not supported for fixed-length arrays.

### Tables

[Tables](https://www.rfc-editor.org/rfc/rfc8610.html#section-3.5.2) are supported with the following constraints:

- Only one group entry is allowed, but [occurrence indicators](https://www.rfc-editor.org/rfc/rfc8610.html#section-3.2) is allowed and respected.
- Only Type1 member keys are supported.

Example:

```
{ * string => int }
```

## Unsupported features

The following CDDL features are currently not supported due to complexity or unclear use cases:

- **Nested tagged data** structures must be wrapped in a separate type to be supported.
- [**Group choices**](https://www.rfc-editor.org/rfc/rfc8610.html#section-2.2.2): Groups must be defined in a separate types, and wrapped in a type choice.
- [**Cuts in maps**](https://www.rfc-editor.org/rfc/rfc8610.html#section-3.5.4): Only 1 group entry is allowed to have occurrence indicator, so cuts are not needed.
- [**Control operators**](https://www.rfc-editor.org/rfc/rfc8610.html#section-3.8) allows to specify additional constraints. The primary use-case of Datum Explorer is to provide readable representation, not to perform thorough validation.
- [**Socket/Plug**](https://www.rfc-editor.org/rfc/rfc8610.html#section-3.9) allows unresolved references, which will be supported later, in other file. In Datum Explorer, the full schema is available as a string, so this feature is not needed.
- [**Generics**](https://www.rfc-editor.org/rfc/rfc8610.html#section-3.10) would add more complexity and in real-world applications can be replaced with explicit types. E.g.

  ```
  Maybe<T> = Just<T> / Nothing

  Just<T> = #6.121([T])

  Nothing = #6.122([])

  Address = #6.121([ paymentCredentials: PaymentCredentials
                   , stakingCredentials: Maybe<StakingCredentials>
                   ])
  ```

  can be replaced with:

  ```
  MaybeStakingCredentials = JustStakingCredentials / Nothing

  JustStakingCredentials = #6.121([StakingCredentials])

  Nothing = #6.122([])

  Address = #6.121([ paymentCredentials: PaymentCredentials
                   , stakingCredentials: Maybe<StakingCredentials>
                   ])
  ```

## Internal representation of readable datum

The Readable Datum is defined by type `TypeWithValue`, defined as follows:

```ts
export type TypeWithValue = {
  type: string;
  value: DatumValue;
};
export type DatumValue = PrimitiveValue | TypeWithValue | Struct | Array;
export type PrimitiveValue = number | string;
export type Struct = ({ name: string } & TypeWithValue)[];
export type Array = DatumValue[];
```

These types are exported so the Frontend and 3rd parties may use them when displaying the data

## Error Handling

- Errors in CDDL schema parsing are exposed directly as thrown by cddl crate, containing clear message and additional details such as position in the CDDL schema.
- Errors in CBOR parsing and matching are enriched with detailed messages to aid debugging, for instance:
  - Missing or invalid member keys in a map.
  - Mismatch between expected and actual array lengths.
  - Unsupported group entry types.
  - Unresolved reference to a type.
- If all choices of a type choices failed to be matched, the `AggregatedError` is rethrown containing all the inner errors. The resulting error message contains entire tree of causes, indented.

## Extensibility

While the current implementation focuses on simplicity, additional features can be added incrementally. Potential future extensions include:

- Support for additional CDDL operators and constraints.
- Enhanced error reporting.

## Conclusion

The adapted CDDL schema language strikes a balance between functionality, simplicity, and readability. By focusing on the most relevant features and limiting complexity, we aim to provide a robust yet user-friendly tool for defining datums.
