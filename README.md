# Datum Explorer

https://datum-explorer.wingriders.com/

Datum Explorer is an open-source project designed to decode, understand, and build with CBOR (Concise Binary Object Representation) data. The tool simplifies working with CBOR by leveraging schema definitions to provide a more human-readable and structured representation of the data.

## Feature roadmap

- [x] **CBOR Parsing Library**: A library for parsing CBOR data using schema definitions.
- [x] **Schema Registry**: A public GitHub repository serving as a registry for schema definitions.
- [x] **Backend Caching**: A backend application that caches schema definitions for efficient access.
- [x] **Frontend Decoder**: A user-friendly frontend application for decoding CBOR with the selected schema.
- [x] **Smart Schema Suggestions**: An improved frontend feature that suggests relevant schemas based on the given CBOR.

Schema definitions are based on CDDL. Details about the supported CDDL features can be found in [cddlDatumSchemaDesign.md](./docs/cddlDatumSchemaDesign.md) document.

---

## Architecture

Architecture of the project can be found in the [architecture.md](./docs/architecture.md) document.

---

## Development setup

This project uses [Bun](https://bun.sh/) as the runtime and package manager and requires [Rust](https://www.rust-lang.org/) for building WebAssembly using wasm-pack.

### Prerequisites

If you don't have Bun or Rust installed:

- **Install Bun**: Follow the installation guide on the [Bun website](https://bun.sh/).
- **Install Rust**: Install Rust using [rustup](https://rustup.rs/).

### Installing dependencies

```shell
bun install
```

---

## Building and running the application

### Environment setup

Before building or running the backend, copy the .env.example file and set up your environment variables:

```shell
cd app
cp .env.example .env
```

Update .env as needed, particularly the `GITHUB_AUTH_TOKEN`. If it's left empty or omitted entirely, the application will automatically use mocked data instead of making requests to GitHub.

How to obtain a GitHub token:

- Go to [GitHub Developer Settings](https://github.com/settings/tokens).
- Generate a new token with read:public_repo permission.
- Add the token to your .env file as `GITHUB_AUTH_TOKEN=<your-token>`.

### Building the project

```shell
bun run build
```

### Running the application

First, navigate to the app workspace:

```shell
cd app
```

Then, start the development server:

```shell
bun dev
```

Next.js will automatically find a free port and output the URL, such as http://localhost:3000 (it's just an example, there is no index page on the server and following the link will result in a 404 Not Found error).

The application manual can be found [here](docs/app-manual.md).

### Triggering the cache update:

The cache is normally updated automatically on a push event to the main branch.
However, for local development, you need to trigger it manually:

```shell
curl -X POST -H 'X-GitHub-Event: push' -d '{"ref": "refs/heads/main"}' http://localhost:3000/api/github/webhook
```

### Accessing the API

- Visit http://localhost:3000/api/schemas to list all cached schemas.
- Visit http://localhost:3000/api/schemas/wingriders%2flaunchpadNode.cddl to see an example schema stored in the cache. Note, if `GITHUB_AUTH_TOKEN` is empty and mock data is used, this schema will not be found.

### Running tests

```shell
bun run test
```

---

## CLI Tool

The CLI tool provides commands for parsing CBOR data using a CDDL schema and validating CDDL schemas.

ℹ️ Note: The CLI tool does not require a .env file.

### Running the CLI Tool

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

The CDDL schema file must be in the current directory. Existing schemas can be found in the [cardano-datum-registry](https://github.com/WingRiders/cardano-datum-registry) repository.

#### Validating a CDDL schema

To validate a CDDL schema file and check for unsupported features:

```shell
bun cli validate-cddl <CDDL schema file name>
```

Example:

```shell
bun cli validate-cddl launchpadNode.cddl
```

### Notes

- Running `bun cli` without a command shows the help menu.
- To run from the root folder, use the following flags:
  - `--filter @wingriders/datum-explorer-lib` to run the CLI in the correct workspace.
  - `--elide-lines=0` flag ensures full output without truncation.
