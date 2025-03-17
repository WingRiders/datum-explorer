import type {ReadableDatum} from '@wingriders/datum-explorer-lib'

export type SchemasResponse = {
  [project: string]: {filePath: string; rootTypeName: string}[]
}

export type SchemaResponse = {cddl: string}

export type ParseCborDetectResponse = {
  schemaFilePath: string
  projectName: string
  rootTypeName: string
  parsedDatum: ReadableDatum
}[]
