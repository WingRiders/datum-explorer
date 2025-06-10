import {Divider, Stack} from '@mui/material'
import {Suspense} from 'react'
import {ExternalLink} from '../components/ExternalLink'
import {DatumParsing} from './DatumParsing'
import {resolveSchemas} from './api/schemas/helpers'

export const dynamic = 'force-dynamic'

const HomePage = async () => {
  const schemas = await resolveSchemas()

  return (
    <Stack sx={{height: '100vh'}}>
      <Stack sx={{p: 3, pb: 2, flex: 1, boxSizing: 'border-box'}}>
        <Suspense>
          <DatumParsing remoteSchemas={schemas} />
        </Suspense>

        <Divider sx={{mt: 3, mb: 1}} />

        <Stack direction="row" spacing={2}>
          <ExternalLink href="https://github.com/WingRiders/datum-explorer">
            GitHub project
          </ExternalLink>
          <ExternalLink href="https://github.com/WingRiders/cardano-datum-registry">
            Schemas registry
          </ExternalLink>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default HomePage
