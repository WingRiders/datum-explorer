import type {NextRequest} from 'next/server'
import {fetchAndCacheCddlSchemas} from '../../../../api/datumRegistry/fetchAndCacheCddlSchemas'
import {config} from '../../../../config'

export const POST = async (req: NextRequest) => {
  if (req.headers.get('X-GitHub-Event') !== 'push')
    return Response.json({message: 'Not a push event'}, {status: 400})

  let payload: unknown
  try {
    payload = await req.json()
  } catch (e) {
    return Response.json({message: `Invalid JSON in the request body: ${e.message}`}, {status: 400})
  }
  if (typeof payload !== 'object')
    return Response.json(
      {message: `Request body should be a JSON object, but it's ${typeof payload}`},
      {status: 400},
    )
  // GH push event must contain ref field: https://docs.github.com/en/webhooks/webhook-events-and-payloads#push
  if (!('ref' in payload))
    return Response.json({message: 'No ref field in the payload'}, {status: 400})
  const expectedRef = `refs/heads/${config.REPOSITORY_BRANCH}`
  if (payload.ref !== expectedRef)
    return Response.json({
      message: `Triggered by a push to branch ${payload.ref}, only ${expectedRef} is supported`,
    })

  try {
    await fetchAndCacheCddlSchemas()
  } catch (e) {
    return Response.json(
      {message: `Failed to fetch and cache CDDL schemas: ${e.message}`},
      {status: 500},
    )
  }
  return Response.json({message: 'CDDL schemas fetched and cached'})
}
