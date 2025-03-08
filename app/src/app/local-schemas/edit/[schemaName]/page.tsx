'use client'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import {Button, Stack, Typography} from '@mui/material'
import {redirect, useRouter} from 'next/navigation'
import {use, useMemo, useRef, useState} from 'react'
import {useShallow} from 'zustand/shallow'
import {useLocalSchemasStore} from '../../../../store/localSchemas'
import {LocalSchemaForm, type LocalSchemaFormInputs} from '../../LocalSchemaForm'
import {ConfirmDeleteLocalSchemaDialog} from './ConfirmDeleteLocalSchemaDialog'

const EditLocalSchemaPage = ({params: paramsPromise}: {params: Promise<{schemaName: string}>}) => {
  const router = useRouter()
  const wasModified = useRef(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const {
    localSchemas,
    editSchema,
    deleteSchema,
    isRehydrated: isLocalSchemasStoreRehydrated,
  } = useLocalSchemasStore(
    useShallow(({localSchemas, editSchema, deleteSchema, isRehydrated}) => ({
      localSchemas,
      editSchema,
      deleteSchema,
      isRehydrated,
    })),
  )

  const params = use(paramsPromise)
  const schemaName = decodeURIComponent(params.schemaName)

  const schema = useMemo(
    () => localSchemas.find((schema) => schema.name === schemaName),
    [localSchemas, schemaName],
  )

  // not redirecting if the schema was not found because it was modified
  if (!schema && isLocalSchemasStoreRehydrated && !wasModified.current) return redirect('/')

  const handleEditSubmit = (data: LocalSchemaFormInputs) => {
    wasModified.current = true
    editSchema(schemaName, {name: data.name, cddl: data.cddl})
    router.push(`/?schema=${encodeURIComponent(data.name)}&local=true`)
  }

  const handleDelete = () => {
    wasModified.current = true
    deleteSchema(schemaName)
    router.push('/')
  }

  return (
    <>
      <Stack p={3} spacing={4}>
        <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button onClick={() => router.back()} startIcon={<ArrowBackIcon />}>
              Back
            </Button>
            <Typography variant="h5">{schema ? `Edit '${schema.name}'` : 'Edit schema'}</Typography>
          </Stack>

          <Button
            variant="text"
            endIcon={<DeleteIcon />}
            color="error"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </Stack>

        <LocalSchemaForm
          submitButtonLabel="Save"
          onSubmit={handleEditSubmit}
          defaultValues={schema ? {name: schema.name, cddl: schema.cddl} : undefined}
        />
      </Stack>

      <ConfirmDeleteLocalSchemaDialog
        schemaName={schemaName}
        open={isDeleteDialogOpen}
        onDelete={handleDelete}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </>
  )
}

export default EditLocalSchemaPage
