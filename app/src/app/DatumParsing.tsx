'use client'

import {Grid2, Stack, TextField} from '@mui/material'
import {useRouter, useSearchParams} from 'next/navigation'
import {useShallow} from 'zustand/shallow'
import type {SchemasResponse} from '../api/types'
import {ParsedDatum} from '../components/ParsedDatum'
import {ParsedDatumDetect} from '../components/ParsedDatumDetect'
import {SchemaSelect} from '../components/SchemaSelect'
import {useLocalSchemasStore} from '../store/localSchemas'
import type {SelectedSchemaId} from '../types'

const DETECT_PARAM_VALUE = 'detect'

type DatumParsingProps = {
  remoteSchemas: SchemasResponse
}

export const DatumParsing = ({remoteSchemas}: DatumParsingProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedSchemaParam = searchParams.get('schema')
  const isLocalSchema = searchParams.get('local')?.toLowerCase() === 'true'
  const datum = searchParams.get('datum')

  const selectedSchemaId: SelectedSchemaId | null = selectedSchemaParam
    ? selectedSchemaParam === DETECT_PARAM_VALUE
      ? 'detect'
      : isLocalSchema
        ? {isLocal: true, schemaName: selectedSchemaParam}
        : {isLocal: false, schemaFilePath: selectedSchemaParam}
    : null

  const {localSchemas} = useLocalSchemasStore(useShallow(({localSchemas}) => ({localSchemas})))

  const handleSelectedSchemaIdChange = (id: SelectedSchemaId | null) => {
    const params = new URLSearchParams(searchParams)
    if (id) {
      if (id === 'detect') {
        params.delete('local')
        params.set('schema', DETECT_PARAM_VALUE)
      } else if (id.isLocal) {
        params.set('local', 'true')
        params.set('schema', id.schemaName)
      } else {
        params.delete('local')
        params.set('schema', id.schemaFilePath)
      }
    } else {
      params.delete('schema')
    }
    router.push(`?${params.toString()}`)
  }

  const handleDatumChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams)
    if (event.target.value) {
      params.set('datum', event.target.value)
    } else {
      params.delete('datum')
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <Stack spacing={3} height="100%">
      <SchemaSelect
        selectedSchemaId={selectedSchemaId}
        onSelectedSchemaIdChange={handleSelectedSchemaIdChange}
        remoteSchemas={remoteSchemas}
        localSchemas={localSchemas}
      />

      <Grid2 container direction="row" spacing={4} height="100%">
        <Grid2 size={{xs: 12, md: 6}}>
          <TextField
            label="Datum"
            value={datum ?? ''}
            onChange={handleDatumChange}
            multiline
            fullWidth
            sx={{height: '100%'}}
            slotProps={{
              input: {sx: {height: '100%', alignItems: 'start'}},
            }}
            variant="filled"
          />
        </Grid2>

        <Grid2 size={{xs: 12, md: 6}}>
          {selectedSchemaId === 'detect' ? (
            <ParsedDatumDetect datumCbor={datum} />
          ) : (
            <ParsedDatum schemaId={selectedSchemaId} datumCbor={datum} />
          )}
        </Grid2>
      </Grid2>
    </Stack>
  )
}
