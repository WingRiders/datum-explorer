export type SchemaId =
  | {
      isLocal: false
      schemaFilePath: string
    }
  | {
      isLocal: true
      schemaName: string
    }
