'use client'

import {Box, Grid2, Stack, TextField, Typography} from '@mui/material'
import {useRouter, useSearchParams} from 'next/navigation'
import type {SchemasResponse} from '../api/types'
import {SchemaSelect} from '../components/SchemaSelect'

type DatumDecodingProps = {
  schemas: SchemasResponse
}

export const DatumDecoding = ({schemas}: DatumDecodingProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedSchemaFilePath = searchParams.get('schema')
  const datum = searchParams.get('datum')

  const handleSelectedSchemaFilePathChange = (filePath: string) => {
    const params = new URLSearchParams(searchParams)
    if (filePath) {
      params.set('schema', filePath)
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
        selectedSchemaFilePath={selectedSchemaFilePath}
        onSelectedSchemaFilePathChange={handleSelectedSchemaFilePathChange}
        schemas={schemas}
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
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor={({palette}) => palette.grey[400]}
            height="100%"
            //p={5}
          >
            <Typography variant="body1">Decoded datum</Typography>
          </Box>
        </Grid2>
      </Grid2>
    </Stack>
  )
}
