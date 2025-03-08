import {parseCbor} from '@wingriders/datum-explorer-lib'
import {compact} from 'lodash'
import type {ParseCborDetectWorkerInput, ParseCborDetectWorkerResponse} from './types'

self.onmessage = async (event: MessageEvent<ParseCborDetectWorkerInput>) => {
  const {cborStringRaw, schemas} = event.data

  const promises = schemas.map<Promise<ParseCborDetectWorkerResponse[number] | null>>(
    async ({name, cddl}) => {
      try {
        const parsedDatum = await parseCbor(cddl, cborStringRaw)
        return {
          schemaName: name,
          parsedDatum,
        }
      } catch {
        return null
      }
    },
  )

  // executing all promises in parallel as we don't expect vast amount of schemas,
  // if this ever causes performance issues, we should implement some throttling
  const response: ParseCborDetectWorkerResponse = compact(await Promise.all(promises))
  self.postMessage(response)
}
