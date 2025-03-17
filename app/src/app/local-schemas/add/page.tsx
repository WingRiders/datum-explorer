'use client'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {Button, Stack, Typography} from '@mui/material'
import {useRouter} from 'next/navigation'
import {useShallow} from 'zustand/shallow'
import {useLocalSchemasStore} from '../../../store/localSchemas'
import {LocalSchemaForm, type LocalSchemaFormInputs} from '../LocalSchemaForm'

const AddLocalSchemaPage = () => {
  const router = useRouter()
  const {addSchema} = useLocalSchemasStore(useShallow(({addSchema}) => ({addSchema})))

  const handleSubmit = (data: LocalSchemaFormInputs) => {
    addSchema({name: data.name, cddl: data.cddl})
    router.push(`/?schema=${encodeURIComponent(data.name)}&local=true`)
  }

  return (
    <Stack p={3} spacing={4}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Button onClick={() => router.back()} startIcon={<ArrowBackIcon />}>
          Back
        </Button>
        <Typography variant="h5">Add new local schema</Typography>
      </Stack>

      <LocalSchemaForm isAddingNew submitButtonLabel="Add schema" onSubmit={handleSubmit} />
    </Stack>
  )
}

export default AddLocalSchemaPage
