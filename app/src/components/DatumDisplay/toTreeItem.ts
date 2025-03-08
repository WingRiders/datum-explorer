import type {DatumValue} from '@wingriders/datum-explorer-lib'
import type {DatumTreeViewItem} from './types'

const datumItemToTreeViewItem = (
  item: DatumValue,
  currentId = '',
  nameOverride?: string,
  index?: number,
): DatumTreeViewItem => {
  // item of a table
  if (Array.isArray(item) && item.length === 2) {
    const [key, value] = item
    const newId = `${currentId}.item.${index}`
    return {
      id: newId,
      name: `Table item #${index}`,
      children: [
        datumItemToTreeViewItem(key, newId, 'key'),
        datumItemToTreeViewItem(value, newId, 'value'),
      ],
    }
  }

  const name = nameOverride ?? getDatumItemName(item, index)
  const type = getDatumItemType(item)
  const newId = getDatumItemNewId(name, type, currentId, index)
  const children = getDatumItemChildren(item, newId)
  const value = getDatumItemValue(item, children)

  return {
    id: newId,
    type,
    name,
    value,
    children,
  }
}

const getDatumItemName = (item: DatumValue, index?: number) => {
  if (typeof item === 'object' && 'name' in item && typeof item.name === 'string') return item.name

  // if index is defined and name is not, it's an array item
  if (index != null) return `Array item #${index}`

  return undefined
}

const getDatumItemType = (item: DatumValue) => {
  if (typeof item === 'object' && 'type' in item && typeof item.type === 'string') return item.type
  return undefined
}

const getDatumItemNewId = (
  name: string | undefined,
  type: string | undefined,
  currentId: string,
  index?: number,
) => {
  const prefix = currentId ? `${currentId}.` : ''
  const suffix = name == null && index != null ? `.${index}` : ''
  return `${prefix}${name ?? type ?? ''}${suffix}`
}

const getDatumItemChildren = (item: DatumValue, newId: string) => {
  if (typeof item === 'object' && 'value' in item) {
    if (Array.isArray(item.value))
      return item.value.map((v, index) => datumItemToTreeViewItem(v, newId, undefined, index))

    if (typeof item.value === 'object') return [datumItemToTreeViewItem(item.value, newId)]
  }

  return undefined
}

const getDatumItemValue = (item: DatumValue, children: DatumTreeViewItem[] | undefined) => {
  if (children && children.length === 0) return '[]'

  if (
    typeof item === 'object' &&
    'value' in item &&
    (typeof item.value === 'string' || typeof item.value === 'number')
  ) {
    return item.value.toString() || '""'
  }

  return undefined
}

// creating a separate function for the public API to avoid exposing the internal arguments of datumItemToTreeViewItem
const datumItemToTreeViewItemPublic = (item: DatumValue) => datumItemToTreeViewItem(item)

export {datumItemToTreeViewItemPublic as datumItemToTreeViewItem}
