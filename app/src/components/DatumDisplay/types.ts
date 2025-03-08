import type {TreeViewBaseItem} from '@mui/x-tree-view'

export type DatumTreeViewItem = TreeViewBaseItem<{
  id: string
  name?: string
  value?: string
  type?: string
}>
