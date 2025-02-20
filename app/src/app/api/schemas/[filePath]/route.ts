import type {SchemaResponse} from '../../../../api/types'

export const GET = async (_: Request, {params}: {params: Promise<{filePath: string}>}) => {
  const response: SchemaResponse = {cddl: (await params).filePath} // Dummy response for now
  return Response.json(response)
}
