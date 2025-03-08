import {Box} from '@mui/material'
import {Suspense} from 'react'
import {DatumParsing} from './DatumParsing'
import {resolveSchemas} from './api/schemas/helpers'

export const dynamic = 'force-dynamic'

const HomePage = async () => {
  const schemas = await resolveSchemas()

  return (
    <Box sx={{p: 3, height: '100vh', boxSizing: 'border-box'}}>
      <Suspense>
        <DatumParsing schemas={schemas} />
      </Suspense>
    </Box>
  )
}

export default HomePage
