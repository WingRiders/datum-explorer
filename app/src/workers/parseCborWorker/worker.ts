import {getAggregateMessage, parseCbor} from '@wingriders/datum-explorer-lib'
import type {ParseCborWorkerInput, ParseCborWorkerResponse} from './types'

self.onmessage = async (event: MessageEvent<ParseCborWorkerInput>) => {
  const {cddlSchemaRaw, cborStringRaw} = event.data
  try {
    const readableDatum = await parseCbor(cddlSchemaRaw, cborStringRaw)
    const response: ParseCborWorkerResponse = {
      isSuccess: true,
      readableDatum,
    }
    self.postMessage(response)
  } catch (e) {
    const response: ParseCborWorkerResponse = {
      isSuccess: false,
      errorMessage: getAggregateMessage(e),
    }
    self.postMessage(response)
  }
}
