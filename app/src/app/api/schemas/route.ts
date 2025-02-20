import type {SchemasResponse} from '../../../api/schemas'

export const GET = () => {
  const response: SchemasResponse = {}
  return Response.json(response)
}
