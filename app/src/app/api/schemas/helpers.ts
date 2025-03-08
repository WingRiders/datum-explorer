import {
  getAllCddlSchemasFromCache,
  isCddlSchemasCacheEmpty,
} from '../../../api/datumRegistry/cddlSchemasCache'
import {fetchAndCacheCddlSchemas} from '../../../api/datumRegistry/fetchAndCacheCddlSchemas'
import type {SchemasResponse} from '../../../api/types'

export const resolveSchemas = async (): Promise<SchemasResponse> => {
  if (isCddlSchemasCacheEmpty()) {
    await fetchAndCacheCddlSchemas()
  }

  const schemas = getAllCddlSchemasFromCache()
  const response: SchemasResponse = Object.fromEntries(
    Object.entries(schemas).map(([projectName, {schemas}]) => [
      projectName,
      Object.entries(schemas).map(([fileName, {rootTypeName}]) => ({
        filePath: `${projectName}/${fileName}`,
        rootTypeName,
      })),
    ]),
  )

  return response
}
