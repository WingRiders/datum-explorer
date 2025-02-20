# Datum Explorer

Datum Explorer is an open-source project designed to decode, understand, and build with CBOR (Concise Binary Object Representation) data. The tool simplifies working with CBOR by leveraging schema definitions to provide a more human-readable and structured representation of the data.

## Feature roadmap

- [x]  **CBOR Parsing Library**: A library for parsing CBOR data using schema definitions.
- [ ]  **Schema Registry**: A public GitHub repository serving as a registry for schema definitions.
- [ ]  **Backend Caching**: A backend application that caches schema definitions for efficient access.
- [ ]  **Frontend Decoder**: A user-friendly frontend application for decoding CBOR with the selected schema.
- [ ]  **Smart Schema Suggestions**: An improved frontend feature that suggests relevant schemas based on the given CBOR.

##

Schema definitions are based on CDDL. Details about the supported CDDL features can be found in [cddlDatumSchemaDesign.md](./docs/cddlDatumSchemaDesign.md) document.

## Architecture

Architecture of the project can be found in the [architecture.md](./docs/architecture.md) document.

## Development

This project uses [Bun](https://bun.sh/) as the runtime and package manager and requires [Rust](https://www.rust-lang.org/) for building WebAssembly using wasm-pack.

If you don't have them installed:
- **Install Bun**: Follow the installation guide on the [Bun website](https://bun.sh/).
- **Install Rust**: Install Rust using [rustup](https://rustup.rs/).

### Installing dependencies

```shell
bun install
```

### Building the library

```shell
bun run build
```

### Running tests

```shell
bun run test
```

### Use the CLI tool

The CLI tool provides commands for parsing CBOR data using a CDDL schema and validating CDDL schemas.
First, run `cd lib` to ensure the following commands execute in the correct workspace.

#### Parsing CBOR with a CDDL schema

To parse CBOR data using a specified CDDL schema file:

```shell
bun cli parse-cbor <CDDL schema file name> <Raw CBOR string>
```

Example:
```shell
bun cli parse-cbor launchpadNode.cddl d8799fd8799fd8799f581c9916b846579fc7109f6ab82fd94c7d9b47af8694ea8697a167b1bb0800ffffd87a801b0000018a5058c6f01a00989680ff
```

#### Validating a CDDL schema

To validate a CDDL schema file and check for unsupported features:

```shell
bun cli validate-cddl <CDDL schema file name>
```

Example:
```shell
bun cli validate-cddl launchpadNode.cddl
```

#### Notes

- Running `bun cli` without a command shows the help menu.
- To run from the root folder, use the following flags:
  - `--filter @wingriders/datum-explorer-lib` to run the CLI in the correct workspace.
  - `--elide-lines=0` flag ensures full output without truncation.
