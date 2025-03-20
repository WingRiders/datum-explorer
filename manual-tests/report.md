# Report

This file contains the testing report related to the Datum Explorer app. Functioning of the Datum Explorer app was tested on several test cases shown below.

Definitions of the testing scenarios can be found in [datum-explorer.feature](./datum-explorer.feature).

## Test cases done

| Scenario                                    | Result        |
| ------------------------------------------- | ------------- |
| Select schema                               | 🟢 SUCCESSFUL |
| Parse valid datum CBOR                      | 🟢 SUCCESSFUL |
| Parse invalid datum CBOR                    | 🟢 SUCCESSFUL |
| Add new local schema                        | 🟢 SUCCESSFUL |
| Edit local schema                           | 🟢 SUCCESSFUL |
| Delete local schema                         | 🟢 SUCCESSFUL |
| Auto schema detection - matching schema     | 🟢 SUCCESSFUL |
| Auto schema detection - no matching schemas | 🟢 SUCCESSFUL |
