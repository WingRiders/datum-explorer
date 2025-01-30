# Architecture

The Datum Explorer architecture is designed to efficiently decode CBOR data using schema definitions.
The core functionality is implemented using Rust, WebAssembly (WASM), and TypeScript libraries,
ensuring high performance and seamless integration with modern web applications.

## Components

1. CDDL Parser
   - Utilizes the [cddl](https://github.com/anweiss/cddl/) Rust crate to decode CDDL (Concise Data Definition Language) from a string into an Abstract Syntax Tree (AST).
   - **WASM Wrapper**: Wraps the Rust library for use in web environments, enabling the decoding of CDDL into a structured AST.
2. CBOR Parser
   - Uses the [cbor-x](https://github.com/kriszyp/cbor-x) library to parse raw CBOR data into a structured format. It matches the parsed data against the CDDL AST to produce a final JSON representation.
   - The decoding pipeline involves several key intermediary structures:
     - **CddlAst**: Represents the AST produced by decoding the CDDL schema.
     - **CborData**: Represents the raw CBOR data parsed using the cbor-x library.
     - **ReadableDatum**: Represents the final matched structure.
3. Backend
   - Caches schema definitions from a public GitHub repository for reuse and efficient schema retrieval.
4. Frontend
   - Uses the library to decode CBOR data and display the parsed results.
   - It includes functionality for selecting schemas fetched from Backend and suggesting schemas based on input CBOR.

## Library workflow

```mermaid
graph TD
    A[CDDL Schema: string] -->|cddl_from_src| B[CDDL AST]
    D[Raw CBOR: bytes] -->|cbor-x| E[CBOR parsed object]
    B -->|Match| F[ReadableDatum object]
    E -->|Match| F
```

## Component interaction

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Library
    participant GitHub

    GitHub->>Backend: Regular update cache with CDDL schemas

    User->>Frontend: Visit the page
    Frontend->>Backend: Get list of available CDDL schemas
    Backend-->>Frontend: Respond with list of available CDDL schemas
    Frontend-->>User: Display the list of available CDDL schemas
    User->>Frontend: Provide raw CBOR and select CDDL schema
    Frontend->>Library: Call parseCbor with CDDL schema and raw CBOR
    Library->>Library: Decode CDDL schema to CDDL AST
    Library->>Library: Parse raw CBOR to CBOR parsed object
    Library->>Library: Match CBOR parsed object with CDDL AST
    Library-->>Frontend: Return ReadableDatum object
    Frontend-->>User: Display decoded data
```