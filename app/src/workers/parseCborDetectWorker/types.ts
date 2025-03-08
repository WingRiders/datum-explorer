import type {ReadableDatum} from '@wingriders/datum-explorer-lib'
import type {LocalSchema} from '../../store/localSchemas'

export type ParseCborDetectWorkerInput = {
  cborStringRaw: string
  schemas: LocalSchema[]
}

export type ParseCborDetectWorkerResponse = {
  schemaName: string
  parsedDatum: ReadableDatum
}[]
