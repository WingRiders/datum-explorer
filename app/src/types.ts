export type SchemaId =
  | {
      isLocal: false
      schemaFilePath: string
    }
  | {
      isLocal: true
      schemaName: string
    }

export type SelectedSchemaId = SchemaId | 'detect'
