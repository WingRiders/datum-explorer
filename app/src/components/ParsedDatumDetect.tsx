import {Alert, AlertTitle, Box, Stack, Tab, Tabs, Typography} from '@mui/material'
import {skipToken} from '@tanstack/react-query'
import {useDebounce} from '@uidotdev/usehooks'
import {useEffect, useRef, useState} from 'react'
import {DATUM_INPUT_FIELD_DEBOUNCE_DELAY} from '../constants'
import {useParseCborDetectQuery} from '../helpers/queries'
import {DatumDisplay} from './DatumDisplay/DatumDisplay'
import {Spinner} from './Spinner'
import {Center} from './utilities'

type ParsedDatumDetectProps = {
  datumCbor: string | null
}

export const ParsedDatumDetect = ({datumCbor}: ParsedDatumDetectProps) => {
  const parseCborDetectWorkerRef = useRef<Worker>(null)

  const [selectedSchemaTabIndex, setSelectedSchemaTabIndex] = useState(0)

  useEffect(() => {
    parseCborDetectWorkerRef.current = new Worker(
      new URL('../workers/parseCborDetectWorker/worker.ts', import.meta.url),
    )
    return () => parseCborDetectWorkerRef.current?.terminate()
  }, [])

  const debouncedDatumCbor = useDebounce(datumCbor, DATUM_INPUT_FIELD_DEBOUNCE_DELAY)

  const {
    data: detectedResults,
    isLoading: isLoadingParsing,
    error: parseError,
  } = useParseCborDetectQuery(
    debouncedDatumCbor
      ? {
          datumCbor: debouncedDatumCbor,
        }
      : skipToken,
    parseCborDetectWorkerRef.current,
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to reset the selected schema tab index when the detected results change
  useEffect(() => {
    setSelectedSchemaTabIndex(0)
  }, [detectedResults])

  if (!debouncedDatumCbor)
    return (
      <Center minHeight={150}>
        <Typography>Enter datum CBOR</Typography>
      </Center>
    )

  if (isLoadingParsing)
    return (
      <Center minHeight={150}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Spinner />
          <Typography>Parsing datum</Typography>
        </Stack>
      </Center>
    )

  if (parseError || !detectedResults)
    return (
      <Alert severity="error" sx={{width: '100%'}}>
        <AlertTitle>Error while parsing datum</AlertTitle>
        {parseError?.message || 'Unknown error'}
      </Alert>
    )

  return (
    <>
      <Box sx={{width: '100%'}}>
        {detectedResults.length > 0 ? (
          <>
            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
              <Tabs
                value={selectedSchemaTabIndex}
                onChange={(_e, value) => setSelectedSchemaTabIndex(value)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {detectedResults.map((result, index) => {
                  const id = result.isLocal ? result.schemaName : result.schemaFilePath
                  return (
                    <Tab
                      key={id}
                      id={`tab-${index}`}
                      aria-controls={`tabpanel-${index}`}
                      label={
                        result.isLocal
                          ? `${result.schemaName} (Your local schemas)`
                          : `${result.rootTypeName} (${result.projectName})`
                      }
                      sx={{
                        textTransform: 'none',
                      }}
                    />
                  )
                })}
              </Tabs>
            </Box>
            {detectedResults.map((result, index) => {
              const id = result.isLocal ? result.schemaName : result.schemaFilePath

              return (
                <div
                  key={id}
                  role="tabpanel"
                  hidden={selectedSchemaTabIndex !== index}
                  id={`tabpanel-${index}`}
                  aria-labelledby={`tab-${index}`}
                >
                  {selectedSchemaTabIndex === index && <DatumDisplay datum={result.parsedDatum} />}
                </div>
              )
            })}
          </>
        ) : (
          <Alert severity="info" sx={{width: '100%'}}>
            The given datum cannot be parsed by any of the available schemas.
          </Alert>
        )}
      </Box>
    </>
  )
}
