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

This project uses [Bun](https://bun.sh/) as the runtime and package manager.
If you don't have Bun installed, you can follow the installation guide on their website.

### Installing dependencies

```
bun install
```

### Building the library

```
bun run build
```

### Running tests

```
bun run test
```