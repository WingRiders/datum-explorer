import {type SkipToken, skipToken, useQuery} from '@tanstack/react-query'
import type {ReadableDatum} from '@wingriders/datum-explorer-lib'
import type {SchemaResponse} from '../api/types'
import type {ParseCborWorkerInput, ParseCborWorkerResponse} from '../workers/parseCborWorker/types'

type SchemaDetailsQueryArgs = {
  schemaFilePath: string
}

export const useSchemaDetailsQuery = (args: SchemaDetailsQueryArgs | SkipToken) =>
  useQuery({
    queryKey: ['schema-details', args],
    queryFn:
      args !== skipToken
        ? async () => {
            const res = await fetch(`/api/schemas/${encodeURIComponent(args.schemaFilePath)}`)
            const data = await res.json()
            if (!res.ok) {
              throw new Error(data.message)
            }
            return data as SchemaResponse
          }
        : skipToken,
  })

type ParseCborQueryArgs = {
  cddlSchemaRaw: string
  datumCbor: string
}

export const useParseCborQuery = (
  args: ParseCborQueryArgs | SkipToken,
  parseCborWorker: Worker | null,
) =>
  useQuery({
    queryKey: ['parse-cbor', args],
    queryFn:
      args !== skipToken && !!parseCborWorker
        ? async () => {
            return new Promise<ReadableDatum>((resolve, reject) => {
              parseCborWorker.onmessage = (event: MessageEvent<ParseCborWorkerResponse>) => {
                const data = event.data
                if (data.isSuccess) resolve(data.readableDatum)
                else reject(new Error(data.errorMessage))
              }
              parseCborWorker.onerror = (event) => reject(event)

              const input: ParseCborWorkerInput = {
                cddlSchemaRaw: args.cddlSchemaRaw,
                cborStringRaw: args.datumCbor,
              }
              parseCborWorker.postMessage(input)
            })
          }
        : skipToken,
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  })
