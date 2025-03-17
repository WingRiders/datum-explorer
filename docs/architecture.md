# Architecture

The Datum Explorer architecture is designed to efficiently decode CBOR data using schema definitions.
The core functionality is implemented using Rust, WebAssembly (WASM), and TypeScript libraries,
ensuring high performance and seamless integration with modern web applications.

## Components

The Datum Explorer is composed of three primary components: **[Library](#Library)**, **[Registry](#Registry)**, and **[Backend](#Backend)**.

- **Library** handles the core functionality, including decoding CDDL and CBOR, matching data, and providing a CLI tool for schema-based parsing.
- **Registry** serves as the source of truth for CDDL schemas, enabling schema updates and contributions via a GitHub repository.
- **Backend** ensures synchronization between the Registry and an in-memory cache, exposing a set of API endpoints to retrieve cached schemas and trigger cache updates.

### Library

- CDDL decoding
  - Utilizes the [cddl](https://github.com/anweiss/cddl/) Rust crate to decode CDDL (Concise Data Definition Language) from a string into an Abstract Syntax Tree (AST).
  - **WASM Wrapper**: Wraps the Rust library for use in web environments, enabling the decoding of CDDL into a structured AST.
- CBOR decoding
    - Uses the [cbor-x](https://github.com/kriszyp/cbor-x) library to parse raw CBOR string into a structured format.
- CDDL - CBOR matching
  - Uses CDDL decoding and CBOR decoding to obtain traversable structures.
  - Matches the decoded CBOR against the CddlAst to produce a final JSON representation.
  - The pipeline involves several key intermediary structures:
      - **CddlAst**: Represents the AST produced by decoding the CDDL schema.
      - **cbor**: Represents the result of decoding the raw CBOR string by the cbor-x library. Its type is unknown and is unfolding when matching with CddlAst.
      - **ReadableDatum**: Represents the final matched structure.
- CDDL validation
  - Uses CDDL decoding to obtain a traversable structure.
  - Checks for unsupported CDDL features and reports validation errors.
- CLI tool
  - Uses CDDL - CBOR matching to display ReadableDatum for the given CDDL schema and raw CBOR data.

#### Library workflow

```mermaid
graph TD
    %% Data nodes
    cddlSchemaRaw[cddlSchemaRaw: string]
    cddlAst[cddl: CddlAst]
    cborString[cborStringRaw: string]
    cbor
    ReadableDatum
    
    %% Process nodes
    match{matchCddlWithCbor}
    cddlFromSrc{cddlFromSrc}
    decodeCbor{decodeCbor}
    
    %% Connections
    cddlSchemaRaw --> cddlFromSrc --> cddlAst
    cborString --> decodeCbor --> cbor
    cddlAst --> match --> ReadableDatum
    cbor --> match
```

#### Component interaction

```mermaid
---
title: Use cli tool in the library to parse CBOR according to the selected CDDL schema
---
sequenceDiagram
    participant User
    participant Library
    participant Filesystem

    User->>Filesystem: Save CDDL schema to a file
    User->>Library: Use cli tool with CDDL schema file name and raw CBOR
    Library->>Filesystem: Read cddlSchemaRaw from the given file
    Library->>Library: Decode cddlSchemaRaw to CddlAst
    Library->>Library: Decode raw CBOR string to CBOR object
    Library->>Library: Match CBOR object with CddlAst
    Library-->>User: Display ReadableDatum object
```

### Registry

- Holds the CDDL schema definitions.
- Allows the public to contribute new schemas and updates via a GitHub repository.
- Push to main branch calls backend endpoint which triggers cache update.

### Backend

- Built using [Next.js](https://nextjs.org/).
- Synchronizes the Registry from GitHub to an in-memory cache.
- Exposes a few key endpoints for managing and accessing CDDL schemas.

#### Endpoints overview

| Endpoint                  | HTTP Method | Description                          | Example Response              |
|---------------------------|-------------|--------------------------------------|-------------------------------|
| `/api/healthcheck`        | `GET`       | Returns health info.                  | `{ "healthy": true, ... }`    |
| `/api/schemas`            | `GET`       | Returns a list of cached schemas.    | `{ "wingriders": [{ ... }] }` |
| `/api/schemas/[filePath]` | `GET`       | Returns a specific schema's content. | `{ "cddl": "..." }`           |
| `/api/github/webhook`     | `POST`      | Triggers a cache update on push.     | `{ "message": "..." }`        |

#### Endpoint details

1. **`GET /api/healthcheck`**
    - **Description**: Returns health info including total number of projects and CDDL schemas.
    - **Response example**:
      ```json
      {
        "healthy": true,
        "projects": 0,
        "schemas": 0
      }
      ```
2. **`GET /api/schemas`**
    - **Description**: Returns a list of available schemas.
    - **Response example**:
      ```json
      {
        "wingriders": [
          { "filePath": "launchpadNode.cddl", "rootTypeName": "LaunchpadNode" }
        ]
      }
      ```

3. **`GET /api/schemas/[filePath]`**
    - **Description**: Fetches a CDDL schema by its file path.
    - **Response example**:
      ```json
      { "cddl": "LaunchpadNode = ..." }
      ```

4. **`POST /api/github/webhook`**
    - **Description**: Handles GitHub push events to update the schema cache.
    - **Expected payload**:
      ```json
      { "ref": "refs/heads/main" }
      ```
    - **Response example**:
      ```json
      { "message": "CDDL schemas fetched and cached" }
      ```

#### Component interaction

```mermaid
---
title: Schema caching, updates triggered by push to GitHub registry, and API requests
---
sequenceDiagram
    participant User
    participant Backend
    participant Cache
    participant Registry

    Registry->>Backend: Send push event (webhook)
    Backend->>Backend: Validate push event
    Backend->>Registry: Fetch CDDL schemas
    Backend->>Cache: Update cached schemas
    Backend-->>Registry: Respond with success or error
    
    User->>Backend: GET /api/schemas
    Backend->>Cache: Retrieve schema list
    Backend-->>User: Return list of cached schemas

    User->>Backend: GET /api/schemas/[filePath]
    Backend->>Cache: Retrieve specific schema by file path
    Backend-->>User: Return the requested schema
```
