# Datum Explorer application manual

The Datum Explorer application is a user-friendly tool designed to parse and manage Cardano datums efficiently. It supports schema selection, automatic schema detection, and the ability to define and maintain local schemas.

## Selecting schema

To parse a datum, first select the schema you wish to use. The app lists all schemas from the [cardano-datum-registry](https://github.com/WingRiders/cardano-datum-registry), along with additional options:

- Detect schema
- Your local schemas
- Add a new local schema

![Select schema](assets/app-manual/select-schema.png)

## Parsing datum

After selecting a schema, enter the datum's CBOR. If the CBOR is valid, the app displays the parsed datum:

![Successful datum parsing](assets/app-manual/datum-parsing-success.png)

If the CBOR is invalid, an error message appears:

![Invalid CBOR](assets/app-manual/datum-parsing-invalid-cbor.png)

If the CBOR is valid but doesn't match the selected schema, you'll see an error message:

![Datum parsing error](assets/app-manual/datum-parsing-error.png)

## Automatic schema detection

If you have a datum's CBOR but don't know its schema, use the automatic schema detection feature. First, select the `Detect schema` option:

![Detect schema](assets/app-manual/detect-schema-select.png)

Next, enter the datum's CBOR. The app attempts to parse it against all available schemas (registry and local). You can switch between detected results:

![Schema detection result](assets/app-manual/detect-schema-result.png)

If no schemas match, the app informs you:

![No matching schema](assets/app-manual/detect-schema-no-result.png)

## Local schemas

In addition to schemas from the remote registry, you can define local schemas available only on your device.

### Add new local schema

To add a local schema, click the `Add new local schema` button in the schema selection dropdown:

![Add new local schema button](assets/app-manual/add-new-local-schema-button.png)

Enter the schema's name and its CDDL definition:

![Local schema input](assets/app-manual/add-new-local-schema-input.png)

Click the `Add schema` button. The new schema appears in your local schemas:

![Local schema added](assets/app-manual/local-schema-added.png)

If there's an error in your schema's CDDL, an error message appears with details:

![Local schema validation error](assets/app-manual/add-new-local-schema-error.png)

### Edit local schema

To edit an existing local schema, click the edit icon next to its name:

![Edit local schema](assets/app-manual/edit-local-schema-button.png)

Update the schema name or CDDL, then click `Save`:

![Edit local schema input](assets/app-manual/edit-local-schema-input.png)

### Delete local schema

To delete a local schema, click the `Delete` button while editing the schema:

![Delete local schema](assets/app-manual/delete-local-schema-button.png)

Then confirm deletion:

![Confirm schema deletion](assets/app-manual/delete-local-schema-confirm.png)
