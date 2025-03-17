import type {NextRequest} from 'next/server'
import {fetchAndCacheCddlSchemas} from '../../../../api/datumRegistry/fetchAndCacheCddlSchemas'
import {config} from '../../../../config'

export const POST = async (req: NextRequest) => {
  if (req.headers.get('X-GitHub-Event') !== 'push') {
    return Response.json({message: 'Not a push event'}, {status: 400})
  }

  const payload = await req.json()
  // GH push event must contain ref field: https://docs.github.com/en/webhooks/webhook-events-and-payloads#push
  if (!('ref' in payload)) {
    return Response.json({message: 'No ref field in the payload'}, {status: 400})
  }
  if (payload.ref !== `refs/heads/${config.REPOSITORY_BRANCH}`) {
    return Response.json({
      message: `Triggered by a push to branch ${payload.ref}, only ${config.REPOSITORY_BRANCH} is supported`,
    })
  }

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
