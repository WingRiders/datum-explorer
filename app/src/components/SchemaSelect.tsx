import {Edit} from '@mui/icons-material'
import {Autocomplete, Box, IconButton, Stack, TextField} from '@mui/material'
import {isEqual} from 'lodash'
import {useRouter} from 'next/navigation'
import {useMemo} from 'react'
import type {SchemasResponse} from '../api/types'
import type {LocalSchema} from '../store/localSchemas'
import type {SchemaId} from '../types'

type SchemaSelectProps = {
  selectedSchemaId: SchemaId | null
  onSelectedSchemaIdChange: (id: SchemaId | null) => void
  remoteSchemas: SchemasResponse
  localSchemas: LocalSchema[]
}

type SchemaSelectOption =
  | {
      isAddNewLocalSchemaOption?: false
      id: SchemaId
      categoryLabel: string
      label: string
    }
  | {
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

    return [...localOptions, addLocalOption, ...remoteOptions]
  }, [remoteSchemas, localSchemas])

  const value = useMemo(
    () =>
      options.find(
        (option) => !option.isAddNewLocalSchemaOption && isEqual(option.id, selectedSchemaId),
      ),
    [options, selectedSchemaId],
  )

  return (
    <Autocomplete
      options={options}
      groupBy={({categoryLabel}) => categoryLabel}
      getOptionLabel={({label, categoryLabel}) => `${label} (${categoryLabel})`}
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
              fontStyle: option.isAddNewLocalSchemaOption ? 'italic' : 'normal',
              textDecoration: option.isAddNewLocalSchemaOption ? 'underline' : 'none',
            }}
          >
            <Box component="span" flex={1} key="label">
              {option.label}
            </Box>
            {!option.isAddNewLocalSchemaOption && option.id.isLocal && (
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
          onSelectedSchemaIdChange(newValue?.id ?? null)
        }
      }}
      blurOnSelect
      fullWidth
    />
  )
}
