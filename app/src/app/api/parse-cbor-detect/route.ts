import {parseCbor} from '@wingriders/datum-explorer-lib'
import {compact} from 'lodash'
import type {NextRequest} from 'next/server'
import {
  getAllCddlSchemasFromCache,
  isCddlSchemasCacheEmpty,
} from '../../../api/datumRegistry/cddlSchemasCache'
import {fetchAndCacheCddlSchemas} from '../../../api/datumRegistry/fetchAndCacheCddlSchemas'
import type {ParseCborDetectResponse} from '../../../api/types'

export const GET = async (request: NextRequest) => {
  const {searchParams} = request.nextUrl
  const datum = searchParams.get('datum')
  if (!datum) {
    return Response.json({error: 'datum URL parameter is required'}, {status: 400})
  }

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

  const allSchemas = Object.entries(getAllCddlSchemasFromCache()).flatMap(
    ([projectName, {schemas}]) =>
      Object.entries(schemas).map(([fileName, {cddl, rootTypeName}]) => ({
        projectName,
        fileName,
        cddl,
        rootTypeName,
      })),
  )

  const promises = allSchemas.map<Promise<ParseCborDetectResponse[number] | null>>(
    async ({projectName, fileName, cddl, rootTypeName}) => {
      try {
        const parsedDatum = await parseCbor(cddl, datum)
        return {
          schemaFilePath: `${projectName}/${fileName}`,
          projectName,
          rootTypeName,
          parsedDatum,
        }
      } catch {
        return null
      }
    },
  )

  // executing all promises in parallel as we don't expect vast amount of schemas,
  // if this ever causes performance issues, we should implement some throttling
  const results: ParseCborDetectResponse = compact(await Promise.all(promises))

  return Response.json(results)
}
