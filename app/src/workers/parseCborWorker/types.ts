import type {ReadableDatum} from '@wingriders/datum-explorer-lib'

export type ParseCborWorkerInput = {
  cddlSchemaRaw: string
  cborStringRaw: string
}

export type ParseCborWorkerResponse =
  | {
      isSuccess: true
      readableDatum: ReadableDatum
    }
  | {
      isSuccess: false
      errorMessage: string
    }
