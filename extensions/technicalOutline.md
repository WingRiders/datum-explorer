# Additional Features: Technical Approach (Outline)

This document outlines the technical approach for each proposed feature.
The diagrams in [architecture/diagrams.md](architecture/diagrams.md) reflect the complete, up-to-date system, incorporating changes from all features.
Mockups are linked in subsections under each feature description.

## 1. Blueprint Integration

Enable first-class support [CIP-0057](https://cips.cardano.org/cip/CIP-57) Plutus Contract Blueprint (plutus.json produced by `aiken build`).

### Goals:
* Parse Plutus Contract Blueprint → convert to `BlueprintDatumAst[]`
* Implement matching CBOR with `BlueprintDatumAst` similarly how it currently works for `CddlAst`
* Preserve schema metadata (description fields) from blueprints where possible
* Keep backend caching unchanged (serve JSON same way as CDDL)

### Technical details
* Registry
  * Allow JSON files to be present in the same folder structure as CDDL files.
  * Enforce uniqueness of base file names. So there cannot be `<base>.json` and `<base>.cddl` in the same folder.
  * Validate Blueprint schema files in CI for pull requests.
* Library
  * Implement Blueprint parser module
  * Validate Blueprint schema file (required sections: validators, datums, redeemers, definitions)
  * Convert extracted types → `BlueprintDatumAst[]`
  * Expose AST and diagnostics via the same API used for CDDL
* Frontend
  * Detect .json extension and invoke Blueprint parser
* CLI
  * Accept .json blueprint files as input along with datum title and CBOR to produce `ReadableDatum`
* Testing
  * Add canonical Blueprint samples to registry test fixtures
  * Unit tests for Plutus Contract Blueprint → `BlueprintDatumAst[]` transformations

### Mockups

See the [1-aiken-integration.png](mockups/1-aiken-integration.png) image in the mockups folder.

## 2. Custom Display of Data Structures

Introduce a pluggable rendering layer enabling more intuitive visualization of common Cardano structures.

### Examples of enhanced representations:

#### Address
* Convert payment/stake credential hashes → bech32.
* Display clickable explorer link for the address.
* Customizable explorer in user settings (Cexplorer/Cardanoscan).
* Provide copy-paste button.
* Robust enough to recognize non-standardized ways of encoding address if used in existing datum definitions in the registry.
* Example CDDL syntax:
  ```cddl
  ; @displayAs Bech32Address
  beneficiary : Address
  ```

#### TxHash
* Display clickable explorer link for the transaction
* Customizable explorer in user settings (Cexplorer/Cardanoscan)
* Provide copy-paste button
* Example CDDL syntax:
  ```cddl
  ; @displayAs TxHash
  tx_hash : bytes
  ```

#### Token ticker
* Convert policyId/assetName into ticker.
* We need to distinguish between policyId and assetName without relying on the field name. Both are of type “bytes”.
* Example CDDL syntax:
  ```cddl
  ; @displayAsType TokenTicker/PolicyId
  ; @displayAsName Treasury A
  a_policy_id : bytes
  
  ; @displayAsType TokenTicker/AssetName
  ; @displayAsName Treasury A
  a_asset_name : bytes
  ```

#### Currency units
* Respects token decimals.
* Convert quantity/policyId/assetName into formatted quantity of a token.
* Example CDDL syntax:
  ```cddl
  ; @displayAsType CurrencyUnits/Quantity
  ; @displayAsName Treasury A
  treasury_a : int
  
  ; @displayAsType CurrencyUnits/PolicyId
  ; @displayAsName Treasury A
  a_policy_id : bytes
  
  
  ; @displayAsType CurrencyUnits/AssetName
  ; @displayAsName Treasury A
  a_asset_name : bytes
  ```

### Configuration sources
* Schema-defined metadata
  * CDDL: add a comment-based directive `@displayAs`.
  * Blueprint: “description” field, which is populated by compiling Aiken code with comment before the field.
    * Example Aiken comment-based directive:
      ```aiken
      /// @displayAs Token
      a_policy_id: PolicyId,
      ```
    * Produces Blueprint JSON object:
      ```json
      {
        "title": "a_policy_id",
        "description": "@displayAs Token",
        "$ref": "#/definitions/cardano~1assets~1PolicyId"
      }
      ```
* User preferences
  * Rich display toggle in UI (similar to dark/light mode)

### Mockups

* Displaying of an address before: see the [2-1-custom-display-before.png](mockups/2-1-custom-display-before.png) image in the mockups folder.
* Displaying of an address after: see the [2-2-custom-display-after.png](mockups/2-2-custom-display-after.png) image in the mockups folder.
* Option in the settings to enable/disable the rich display: see the [2-3-custom-display-settings.png](mockups/2-3-custom-display-settings.png) image in the mockups folder.

## 3. Light / Dark Mode Switch

A simple UI improvement with a global theme toggle.

Implementation:
* Tailwind or Next.js Theme provider.
* LocalStorage persistence.
* The default value is set based on the system theme.
* Does not affect backend or library.

### Mockups

Option in the settings to select the app theme: see the [3-app-theme-settings.png](mockups/3-app-theme-settings.png) image in the mockups folder.

## 4. Tooltips

Enrich the `ReadableDatum` UI with tooltips taken from comment-based `@tooltip` directive in the schema.
* Attach them as metadata to corresponding nodes in `ReadableDatum`.
* Display them as tooltips in the frontend.
* Hovering over the (?) icon next to a field in the decoded datum shows the tooltip.

### Mockups

See the [4-tooltips.png](mockups/4-tooltips.png) image in the mockups folder.

## 5. Highlight on Hover

A major developer-experience enhancement.

### Functionality

When hovering over:
* a field in the `ReadableDatum` → highlight the corresponding byte slice in the raw CBOR.
* a byte region in the raw CBOR → highlight the field in the `ReadableDatum`.

### Technical work

* Fork [cbor-x](https://github.com/kriszyp/cbor-x) library and expose byte offset metadata in the decoded structure.
* Extend the matching engine to expose byte offset metadata:
  * For each node in `ReadableDatum`, include `{start, end}` offsets.
* Frontend binds mouse events to corresponding slices.
* Use color palettes for multi-level nesting.

### Reuse by ecosystem

Since `ReadableDatum` is exposed in the lib, the start/end offsets are available for use in:
* wallets
* explorers
* other debugging tools

### Mockups

See the [5-highlight-on-hover.png](mockups/5-highlight-on-hover.png) image in the mockups folder.

## 6. Improved Error Handling

Enhance both CLI and UI with precise decoding errors.

### Features
* Byte-level highlight of where decoding failed.
* Human-readable messages:
  > “Unexpected type: expected list, got integer”
  > 
  > “Missing field X at this location”
* Link error to CBOR byte slice.

### Library-level changes

Matching engine will return error objects enriched with `cborOffset`.

### Frontend
* Highlight the exact portion of CBOR causing the issue.
* Display tooltip or side panel with explanation and path to the field causing the error.

This feature is also fully reusable by external tooling (wallets, explorers, DApps).

### Mockups

See the [6-error-handling.png](mockups/6-error-handling.png) image in the mockups folder.

## 7. Chrome Extension: “Parse Cardano datum”

We will develop a lightweight Chrome extension that integrates with the Datum Explorer library.

### Key capabilities
* Detects user selection on a webpage (hex/CBOR base16 string).
* Add a right-click context menu action: “Parse Cardano datum”.
* Launch a side panel using the existing WASM-based decoder.
* Use endpoints from the hosted Backend.

### Technical components
* [Manifest V3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3) Chrome extension.
* UI built with lightweight React.
* Hosted backend endpoints used by extensions’s content script:
  * `/api/schemas` for fetching all schemas.
  * `/api/parse-cbor-detect` for auto-detection of datum schema.

### Other considerations
* Service workers are not needed. Code will run once the user does a right-click.

### Mockups
* The Parse Cardano datum option in the context menu in the UI of a Cardano wallet: See the [7-1-chrome-extension-context-menu.png](mockups/7-1-chrome-extension-context-menu.png) image in the mockups folder.
* Chrome extension panel that displays the parsed datum: See the [7-2-chrome-extension-side-panel.png](mockups/7-2-chrome-extension-side-panel.png) image in the mockups folder.
