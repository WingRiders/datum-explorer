import type {SchemasResponse} from '../../../api/types'

export const GET = () => {
  const response: SchemasResponse = {} // Dummy response for now
  return Response.json(response)
}
