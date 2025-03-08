import {type SkipToken, skipToken, useQuery} from '@tanstack/react-query'
import type {ReadableDatum} from '@wingriders/datum-explorer-lib'
import {useShallow} from 'zustand/shallow'
import type {SchemaResponse} from '../api/types'
import {useLocalSchemasStore} from '../store/localSchemas'
import type {SchemaId} from '../types'
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

export const useSchemaCddl = (schemaId: SchemaId | null) => {
  const {localSchemaDetails, isRehydrated: isLocalSchemasStoreRehydrated} = useLocalSchemasStore(
    useShallow(({localSchemas, isRehydrated}) => ({
      localSchemaDetails: schemaId?.isLocal
        ? localSchemas.find((schema) => schema.name === schemaId.schemaName)
        : undefined,
      isRehydrated,
    })),
  )

  const {data: remoteSchemaDetails, isLoading: isLoadingRemoteSchemaDetails} =
    useSchemaDetailsQuery(
      schemaId && !schemaId.isLocal ? {schemaFilePath: schemaId.schemaFilePath} : skipToken,
    )

  return {
    schemaCddl: schemaId?.isLocal ? localSchemaDetails?.cddl : remoteSchemaDetails?.cddl,
    isLoading: schemaId?.isLocal ? !isLocalSchemasStoreRehydrated : isLoadingRemoteSchemaDetails,
  }
}
