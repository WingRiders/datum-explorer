import {
  getCddlSchema,
  isCddlSchemasCacheEmpty,
} from '../../../../api/datumRegistry/cddlSchemasCache'
import {fetchAndCacheCddlSchemas} from '../../../../api/datumRegistry/fetchAndCacheCddlSchemas'
import type {SchemaResponse} from '../../../../api/types'

export const GET = async (_: Request, {params}: {params: Promise<{filePath: string}>}) => {
  const filePath = (await params).filePath
  const projectAndFileNames = filePath.split('/')
  if (projectAndFileNames.length !== 2) {
    return Response.json({message: `Invalid file path ${filePath}`}, {status: 400})
  }
  const [projectName, fileName] = projectAndFileNames

  if (isCddlSchemasCacheEmpty()) {
    try {
      await fetchAndCacheCddlSchemas()
    } catch (e) {
      return Response.json(
        {message: `Failed to fetch and cache CDDL schemas: ${e.message}`},
        {status: 500},
      )
    }
  }

  const cddlSchema = getCddlSchema(projectName, fileName)
  if (cddlSchema == null) {
    return Response.json(
      {message: `${filePath} schema not found among cached schemas`},
      {status: 404},
    )
  }

  const response: SchemaResponse = {cddl: cddlSchema.cddl}
  return Response.json(response)
}
