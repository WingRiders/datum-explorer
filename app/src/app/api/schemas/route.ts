import {} from '../../../api/datumRegistry/cddlSchemasCache'
import {resolveSchemas} from './helpers'

export const GET = async () => {
  try {
    const schemas = await resolveSchemas()
    return Response.json(schemas)
  } catch (e) {
    return Response.json(
      {
        message: `Failed to fetch and cache CDDL schemas: ${e instanceof Error ? e.message : String(e)}`,
      },
      {status: 500},
    )
  }
}
