export type SchemasResponse = {
  [project: string]: {filePath: string; rootTypeName: string}[]
}

export type SchemaResponse = {cddl: string}
