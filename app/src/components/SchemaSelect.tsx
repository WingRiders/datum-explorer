import {Autocomplete, TextField} from '@mui/material'
import {useMemo} from 'react'
import type {SchemasResponse} from '../api/types'

type SchemaSelectProps = {
  selectedSchemaFilePath: string | null
  onSelectedSchemaFilePathChange: (filePath: string) => void
  schemas: SchemasResponse
}

export const SchemaSelect = ({
  selectedSchemaFilePath,
  onSelectedSchemaFilePathChange,
  schemas,
}: SchemaSelectProps) => {
  const options = useMemo(
    () =>
      Object.entries(schemas)
        .sort(([projectNameA], [projectNameB]) => projectNameA.localeCompare(projectNameB))
        .flatMap(([projectName, schemas]) =>
          schemas
            .sort(({rootTypeName: rootTypeNameA}, {rootTypeName: rootTypeNameB}) =>
              rootTypeNameA.localeCompare(rootTypeNameB),
            )
            .map(({filePath, rootTypeName}) => ({projectName, filePath, rootTypeName})),
        ),
    [schemas],
  )

  const value = useMemo(
    () => options.find(({filePath}) => filePath === selectedSchemaFilePath),
    [options, selectedSchemaFilePath],
  )

  return (
    <Autocomplete
      options={options}
      groupBy={({projectName}) => projectName}
      getOptionLabel={({projectName, rootTypeName}) => `${rootTypeName} (${projectName})`}
      renderInput={(params) => <TextField {...params} label="Schema" />}
      renderOption={(props, option) => (
        <li {...props} key={props.key}>
          {option.rootTypeName}
        </li>
      )}
      value={value ?? null}
      onChange={(_, newValue) => onSelectedSchemaFilePathChange(newValue?.filePath ?? '')}
      blurOnSelect
      fullWidth
    />
  )
}
