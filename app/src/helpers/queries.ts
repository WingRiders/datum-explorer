import {type SkipToken, skipToken, useQuery} from '@tanstack/react-query'
import type {ReadableDatum} from '@wingriders/datum-explorer-lib'
import {useShallow} from 'zustand/shallow'
import type {ParseCborDetectResponse, SchemaResponse} from '../api/types'
import {useLocalSchemasStore} from '../store/localSchemas'
import type {SchemaId} from '../types'
import type {
  ParseCborDetectWorkerInput,
  ParseCborDetectWorkerResponse,
} from '../workers/parseCborDetectWorker/types'
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

export const useParseCborQuery = (args: ParseCborQueryArgs | SkipToken) =>
  useQuery({
    queryKey: ['parse-cbor', args],
    queryFn:
      args !== skipToken
        ? async () => {
            return new Promise<ReadableDatum>((resolve, reject) => {
              const parseCborWorker = new Worker(
                new URL('../workers/parseCborWorker/worker.ts', import.meta.url),
              )

              parseCborWorker.onmessage = (event: MessageEvent<ParseCborWorkerResponse>) => {
                parseCborWorker.terminate()
                const data = event.data
                if (data.isSuccess) resolve(data.readableDatum)
                else reject(new Error(data.errorMessage))
              }
              parseCborWorker.onerror = (event) => {
                parseCborWorker.terminate()
                reject(event)
              }

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

type ParseCborDetectQueryArgs = {
  datumCbor: string
}

type ParseCborDetectQueryResult = Array<
  | {isLocal: true; schemaName: string; parsedDatum: ReadableDatum}
  | {
      isLocal: false
      schemaFilePath: string
      projectName: string
      rootTypeName: string
      parsedDatum: ReadableDatum
    }
>

export const useParseCborDetectQuery = (args: ParseCborDetectQueryArgs | SkipToken) => {
  const {localSchemas} = useLocalSchemasStore(
    useShallow(({localSchemas}) => ({
      localSchemas,
    })),
  )

  return useQuery({
    queryKey: ['parse-cbor-detect', args, localSchemas],
    queryFn:
      args !== skipToken
        ? async () => {
            const localDetectPromise = new Promise<ParseCborDetectQueryResult>(
              (resolve, reject) => {
                const parseCborDetectWorker = new Worker(
                  new URL('../workers/parseCborDetectWorker/worker.ts', import.meta.url),
                )
                parseCborDetectWorker.onmessage = (
                  event: MessageEvent<ParseCborDetectWorkerResponse>,
                ) => {
                  parseCborDetectWorker.terminate()
                  resolve(
                    event.data.map(({schemaName, parsedDatum}) => ({
                      isLocal: true,
                      schemaName,
                      parsedDatum,
                    })),
                  )
                }

                parseCborDetectWorker.onerror = (event) => {
                  parseCborDetectWorker.terminate()
                  reject(event)
                }

                const input: ParseCborDetectWorkerInput = {
                  cborStringRaw: args.datumCbor,
                  schemas: localSchemas,
                }
                parseCborDetectWorker.postMessage(input)
              },
            )

            const remoteDetectPromise: Promise<ParseCborDetectQueryResult> = fetch(
              `/api/parse-cbor-detect?datum=${args.datumCbor}`,
            )
              .then((res) => res.json() as Promise<ParseCborDetectResponse>)
              .then((data) =>
                data.map(({schemaFilePath, projectName, rootTypeName, parsedDatum}) => ({
                  isLocal: false,
                  schemaFilePath,
                  projectName,
                  rootTypeName,
                  parsedDatum,
                })),
              )

            // executing both promises in parallel, there is a room for improvement - we could show results
            // from one of the promises as soon as it resolves, and show results from the other promise later
            const result = await Promise.all([localDetectPromise, remoteDetectPromise])
            return result.flat()
          }
        : skipToken,
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  })
}
