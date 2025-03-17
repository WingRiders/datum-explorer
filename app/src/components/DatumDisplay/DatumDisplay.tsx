'use client'

import {Typography} from '@mui/material'
import {
  RichTreeView,
  TreeItem2Content,
  TreeItem2GroupTransition,
  TreeItem2Icon,
  TreeItem2IconContainer,
  TreeItem2Label,
  TreeItem2Provider,
  TreeItem2Root,
  type UseTreeItem2Parameters,
  useTreeItem2,
} from '@mui/x-tree-view'
import type {ReadableDatum} from '@wingriders/datum-explorer-lib'
import {type ReactNode, forwardRef, useMemo, useState} from 'react'
import {datumItemToTreeViewItem} from './toTreeItem'
import type {DatumTreeViewItem} from './types'

type DatumDisplayProps = {
  datum: ReadableDatum
}

export const DatumDisplay = ({datum}: DatumDisplayProps) => {
  const {items, idsOfAllExpandableItems} = useMemo(() => {
    const items = [datumItemToTreeViewItem(datum)]
    const idsOfAllExpandableItems = getIdsOfAllExpandableItems(items)
    return {items, idsOfAllExpandableItems}
  }, [datum])

  const [expandedItems, setExpandedItems] = useState(idsOfAllExpandableItems)

  return (
    <RichTreeView
      items={items}
      getItemLabel={getItemLabel}
      expandedItems={expandedItems}
      onExpandedItemsChange={(_e, itemIds) => setExpandedItems(itemIds)}
      disableSelection
      slots={{item: CustomTreeItem}}
    />
  )
}

const getItemLabel = ({name, value, type}: DatumTreeViewItem) => {
  // if there is exactly one of the three, use it as the label
  if ([name, value, type].filter((v) => v != null).length === 1) return (name || value || type)!

  // if there is a name and a value, use both as the label (potential type is displayed outside of the label)
  if (name != null && value != null) return `${name}: ${value}`

  return name ?? value ?? type ?? 'Unknown'
}

const getIdsOfAllExpandableItems = (items: DatumTreeViewItem[]) => {
  const itemIds: string[] = []

  const registerItemId = (item: DatumTreeViewItem) => {
    if (item.children?.length) {
      itemIds.push(item.id)
      item.children.forEach(registerItemId)
    }
  }
  items.forEach(registerItemId)

  return itemIds
}

const isExpandable = (reactChildren: ReactNode) => {
  if (Array.isArray(reactChildren)) {
    return reactChildren.length > 0 && reactChildren.some(isExpandable)
  }
  return Boolean(reactChildren)
}

type CustomTreeItemProps = Omit<UseTreeItem2Parameters, 'rootRef'> &
  Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'>

const CustomTreeItem = forwardRef(function CustomTreeItem(
  props: CustomTreeItemProps,
  ref: React.Ref<HTMLLIElement>,
) {
  const {id, itemId, label, disabled, children, ...other} = props

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getLabelProps,
    getGroupTransitionProps,
    status,
    publicAPI,
  } = useTreeItem2({id, itemId, children, label, disabled, rootRef: ref})

  const item = publicAPI.getItem(itemId)
  const expandable = isExpandable(children)

  return (
    <TreeItem2Provider itemId={itemId}>
      <TreeItem2Root {...getRootProps(other)}>
        <TreeItem2Content {...getContentProps()}>
          <TreeItem2IconContainer {...getIconContainerProps()}>
            <TreeItem2Icon status={status} />
          </TreeItem2IconContainer>
          <TreeItem2Label
            {...getLabelProps({
              expandable: (expandable && status.expanded).toString(),
            })}
          />
          {(item.name || item.value) && <Typography variant="caption">{item.type}</Typography>}
        </TreeItem2Content>
        {children && <TreeItem2GroupTransition {...getGroupTransitionProps()} />}
      </TreeItem2Root>
    </TreeItem2Provider>
  )
})
