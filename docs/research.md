# Research Results: Schema definition language and parsing approach

## Custom language exploration

Initially, we explored the possibility of creating a custom language tailored to our needs. The main advantages were:
- No unnecessary features.
- Full control over syntax and semantics.
- Ability to tailor it for specific project requirements.

However, significant drawbacks led us to reconsider:
- We would need to implement a parser and lexer from scratch.
- Maintenance burden, especially as new features are introduced.
- Limited adoption and documentation compared to existing solutions.

We implemented a [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for our proposed syntax but encountered limitations:
- Tree-sitter does not handle indentation by default.
- It lacks semantic resolution, allowing typos in type names to pass unnoticed.
- Defining complex types (e.g., tagged data, constrained structures and arrays) required workarounds that affected clarity.

Due to these challenges, we shifted our focus to established schema definition languages.

## Comparison of JSON, Protobuf, and CDDL

### JSON
- Pros: Simple, human-readable, widely supported.
- Cons: Too verbose for our use case.

### Protobuf

[Protocol buffers](https://protobuf.dev/) were good candidate because of binary data decoding support
- Pros: Efficient binary format, built-in parsers and encoders in multiple languages.
- Cons:
    - No native BigInt support.
    - Requires explicit field numbering.
    - Handling constrained structures (constr) and tagged data would require additional effort.
    - Not ideal for our UI-based schema generation approach.

We considered modifying Protobuf to support constrained structures but estimated that the required effort was unpredictable and potentially high.

### CDDL (Concise Data Definition Language)

[CDDL](https://datatracker.ietf.org/doc/html/rfc8610) emerged as the best candidate due to its close integration with [CBOR](https://cbor.io/), which is a natural fit for our data format.
- Pros:
    - Compact and expressive syntax.
    - Direct compatibility with CBOR.
    - Well-defined support for constrained structures (constr).
    - Schema validation can be performed using existing Rust libraries.
- Cons:
    - Fewer tools and ecosystem support compared to Protobuf.

We confirmed that the [Rust-based CDDL parser](https://github.com/anweiss/cddl/) works well but produces a highly comprehensive AST. This led to the following implementation considerations:
1. **WASM Wrapper:**
    - We could create a simplified AST wrapper for our specific use case.
2. **Full Parsing in Rust:**
    - CDDL decoding and validation can be handled in Rust.
    - Custom visitor patterns may be needed to simplify processing.

## Decision

After evaluating all options, we decided to use **CDDL** as our schema definition language.
- It aligns well with our use case.
- It supports constrained structures natively.
- Rust-based parsing solutions can be adapted with moderate effort.

To improve usability, we will:
- Investigate potential UI-based schema generation to abstract away syntax details.

This decision balances flexibility, maintainability, and integration with existing CBOR-based systems.

