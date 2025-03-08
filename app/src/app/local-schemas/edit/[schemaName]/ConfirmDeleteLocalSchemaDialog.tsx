import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

type ConfirmDeleteLocalSchemaDialogProps = {
  schemaName: string
  open: boolean
  onDelete?: () => void
  onClose?: () => void
}

export const ConfirmDeleteLocalSchemaDialog = ({
  schemaName,
  open,
  onDelete,
  onClose,
}: ConfirmDeleteLocalSchemaDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle id="alert-dialog-title">{`Delete '${schemaName}'?`}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This action will remove the schema from your local schemas.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onDelete} autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
