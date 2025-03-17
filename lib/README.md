# Datum Explorer Library

Datum Explorer is an open-source library designed to decode, understand, and build with CBOR (Concise Binary Object Representation) data. The library simplifies working with CBOR by leveraging schema definitions to provide a more human-readable and structured representation of the data.

## Features

- **CBOR Parsing**: Parses CBOR data using CDDL schema.
- **CDDL Validation**: Validates CDDL schema files and checks for unsupported features.

## Get started

### npm
```sh
npm install @wingriders/datum-explorer-lib
```

### pnpm
```sh
pnpm add @wingriders/datum-explorer-lib
```

### yarn
```sh
yarn add @wingriders/datum-explorer-lib
```

## Usage

### Parsing CBOR with a CDDL schema

To parse CBOR data using a specified CDDL schema file:

```ts
import {parseCbor} from '@wingriders/datum-explorer-lib'

const result = await parseCbor('<CDDL schema file contents>', '<Raw CBOR string>')
console.log(result)
```


### Validating CDDL schema and checking unsupported features

To validate specified CDDL schema file and check unsupported features:

```ts
import {validateCddl} from '@wingriders/datum-explorer-lib'

// Throws an error if the schema is invalid or is using unsupported features
await validateCddl('<CDDL schema file contents>')
```
