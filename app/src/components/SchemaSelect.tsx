import {Edit} from '@mui/icons-material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import {Autocomplete, IconButton, Stack, TextField} from '@mui/material'
import {isEqual} from 'lodash'
import {useRouter} from 'next/navigation'
import {useMemo} from 'react'
import type {SchemasResponse} from '../api/types'
import type {LocalSchema} from '../store/localSchemas'
import type {SchemaId, SelectedSchemaId} from '../types'
import {Center} from './utilities'

type SchemaSelectProps = {
  selectedSchemaId: SelectedSchemaId | null
  onSelectedSchemaIdChange: (id: SelectedSchemaId | null) => void
  remoteSchemas: SchemasResponse
  localSchemas: LocalSchema[]
}

type SchemaSelectOption =
  | {
      isDetectOption: true
      isAddNewLocalSchemaOption?: false
      label: string
    }
  | {
      isDetectOption?: false
      isAddNewLocalSchemaOption?: false
      id: SchemaId
      categoryLabel: string
      label: string
    }
  | {
      isDetectOption?: false
      isAddNewLocalSchemaOption: true
      categoryLabel: string
      label: string
    }

export const SchemaSelect = ({
  selectedSchemaId,
  onSelectedSchemaIdChange,
  remoteSchemas,
  localSchemas,
}: SchemaSelectProps) => {
  const router = useRouter()

  const options = useMemo(() => {
    const remoteOptions = Object.entries(remoteSchemas)
      .sort(([projectNameA], [projectNameB]) => projectNameA.localeCompare(projectNameB))
      .flatMap(([projectName, schemas]) =>
        schemas
          .sort(({rootTypeName: rootTypeNameA}, {rootTypeName: rootTypeNameB}) =>
            rootTypeNameA.localeCompare(rootTypeNameB),
          )
          .map<SchemaSelectOption>(({filePath, rootTypeName}) => ({
            id: {isLocal: false, schemaFilePath: filePath},
            categoryLabel: projectName,
            label: rootTypeName,
          })),
      )

    const localSchemasCategoryLabel = 'Your local schemas'

    const localOptions = localSchemas.map<SchemaSelectOption>(({name}) => ({
      id: {isLocal: true, schemaName: name},
      categoryLabel: localSchemasCategoryLabel,
      label: name,
    }))

    const addLocalOption: SchemaSelectOption = {
      isAddNewLocalSchemaOption: true,
      categoryLabel: localSchemasCategoryLabel,
      label: 'Add new local schema',
    }

    const detectOption: SchemaSelectOption = {
      isDetectOption: true,
      label: 'Detect schema',
    }

    return [detectOption, ...localOptions, addLocalOption, ...remoteOptions]
  }, [remoteSchemas, localSchemas])

  const value = useMemo(
    () =>
      options.find((option) => {
        if (option.isDetectOption) {
          return selectedSchemaId === 'detect'
        }

        return !option.isAddNewLocalSchemaOption && isEqual(option.id, selectedSchemaId)
      }),
    [options, selectedSchemaId],
  )

  return (
    <Autocomplete
      options={options}
      groupBy={(option) => (!option.isDetectOption ? option.categoryLabel : '')}
      getOptionLabel={(option) =>
        option.isDetectOption ? option.label : `${option.label} (${option.categoryLabel})`
      }
      renderInput={(params) => <TextField {...params} label="Schema" />}
      renderOption={(props, option) => {
        return (
          <Stack
            component="li"
            {...props}
            key={props.key}
            direction="row"
            justifyContent="flex-end"
            sx={{
              fontStyle:
                option.isAddNewLocalSchemaOption || option.isDetectOption ? 'italic' : 'normal',
              textDecoration: option.isAddNewLocalSchemaOption ? 'underline' : 'none',
            }}
          >
            <Stack
              component="span"
              flex={1}
              key="label"
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <span>{option.label}</span>
              {option.isDetectOption && (
                <Center>
                  <AutoAwesomeIcon fontSize="inherit" />
                </Center>
              )}
            </Stack>
            {!option.isAddNewLocalSchemaOption && !option.isDetectOption && option.id.isLocal && (
              <IconButton
                key="edit-button"
                onClick={(e) => {
                  if (!option.id.isLocal) return

                  e.stopPropagation()
                  e.preventDefault()
                  router.push(`/local-schemas/edit/${encodeURIComponent(option.id.schemaName)}`)
                }}
              >
                <Edit />
              </IconButton>
            )}
          </Stack>
        )
      }}
      value={value ?? null}
      onChange={(_, newValue) => {
        if (newValue?.isAddNewLocalSchemaOption) {
          router.push('/local-schemas/add')
        } else {
          onSelectedSchemaIdChange(newValue?.isDetectOption ? 'detect' : (newValue?.id ?? null))
        }
      }}
      blurOnSelect
      fullWidth
    />
  )
}
