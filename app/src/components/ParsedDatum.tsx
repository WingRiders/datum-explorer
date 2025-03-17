import {Alert, AlertTitle, Stack, Typography} from '@mui/material'
import {skipToken} from '@tanstack/react-query'
import {useDebounce} from '@uidotdev/usehooks'
import {useEffect, useRef} from 'react'
import {useParseCborQuery, useSchemaCddl} from '../helpers/queries'
import type {SchemaId} from '../types'
import {DatumDisplay} from './DatumDisplay/DatumDisplay'
import {Spinner} from './Spinner'
import {Center} from './utilities'

const DEBOUNCE_DELAY = 100

type ParsedDatumProps = {
  schemaId: SchemaId | null
  datumCbor: string | null
}

export const ParsedDatum = ({schemaId, datumCbor}: ParsedDatumProps) => {
  const parseCborWorkerRef = useRef<Worker>(null)

  useEffect(() => {
    parseCborWorkerRef.current = new Worker(
      new URL('../workers/parseCborWorker/worker.ts', import.meta.url),
    )
    return () => parseCborWorkerRef.current?.terminate()
  }, [])

  const debouncedDatumCbor = useDebounce(datumCbor, DEBOUNCE_DELAY)

  const {schemaCddl, isLoading: isLoadingSchemaCddl} = useSchemaCddl(schemaId)

  const {
    data: readableDatum,
    isLoading: isLoadingParsing,
    error: parseError,
  } = useParseCborQuery(
    schemaCddl && debouncedDatumCbor
      ? {
          cddlSchemaRaw: schemaCddl,
          datumCbor: debouncedDatumCbor,
        }
      : skipToken,
    parseCborWorkerRef.current,
  )

  if (!schemaId || !debouncedDatumCbor)
    return (
      <Center minHeight={150}>
        <Typography>Select schema and enter datum CBOR</Typography>
      </Center>
    )

  if (isLoadingParsing || (isLoadingSchemaCddl && debouncedDatumCbor))
    return (
      <Center minHeight={150}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Spinner />
          <Typography>{isLoadingSchemaCddl ? 'Loading schema' : 'Parsing datum'}</Typography>
        </Stack>
      </Center>
    )

  if (parseError || !readableDatum)
    return (
      <Alert severity="error" sx={{width: '100%'}}>
        <AlertTitle>Error while parsing datum</AlertTitle>
        {parseError?.message || 'Unknown error'}
      </Alert>
    )

  return <DatumDisplay datum={readableDatum} />
}
