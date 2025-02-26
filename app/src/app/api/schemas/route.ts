import {
  getAllCddlSchemasFromCache,
  isCddlSchemasCacheEmpty,
} from '../../../api/datumRegistry/cddlSchemasCache'
import {fetchAndCacheCddlSchemas} from '../../../api/datumRegistry/fetchAndCacheCddlSchemas'
import type {SchemasResponse} from '../../../api/types'

export const GET = async () => {
  if (isCddlSchemasCacheEmpty()) {
    try {
      await fetchAndCacheCddlSchemas()
    } catch (e) {
      return Response.json(
        {
          message: `Failed to fetch and cache CDDL schemas: ${
            e instanceof Error ? e.message : String(e)
          }`,
        },
        {status: 500},
      )
    }
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

  return Response.json(response)
}
