import type {DatumValue} from '@wingriders/datum-explorer-lib'
import {describe, expect, test} from 'vitest'
import {datumItemToTreeViewItem} from '../../../src/components/DatumDisplay/toTreeItem'
import type {DatumTreeViewItem} from '../../../src/components/DatumDisplay/types'

describe('datumItemToTreeViewItem', () => {
  const testCases: {name: string; input: DatumValue; expected: DatumTreeViewItem}[] = [
    {
      name: 'should handle primitive string values',
      input: {
        type: 'string',
        value: 'test value',
      },
      expected: {
        id: 'string',
        type: 'string',
        name: undefined,
        value: 'test value',
        children: undefined,
      },
    },
    {
      name: 'should handle primitive number values',
      input: {
        type: 'integer',
        value: 42,
      },
      expected: {
        id: 'integer',
        type: 'integer',
        name: undefined,
        value: '42',
        children: undefined,
      },
    },
    {
      name: 'should handle array values',
      input: {
        type: 'array',
        value: [
          {type: 'string', value: 'item1'},
          {type: 'integer', value: 2},
        ],
      },
      expected: {
        id: 'array',
        type: 'array',
        name: undefined,
        value: undefined,
        children: [
          {
            id: 'array.Array item #0',
            type: 'string',
            name: 'Array item #0',
            value: 'item1',
            children: undefined,
          },
          {
            id: 'array.Array item #1',
            type: 'integer',
            name: 'Array item #1',
            value: '2',
            children: undefined,
          },
        ],
      },
    },
    {
      name: 'should handle empty array values',
      input: {
        type: 'array',
        value: [],
      },
      expected: {
        id: 'array',
        type: 'array',
        name: undefined,
        value: '[]',
        children: [],
      },
    },
    {
      name: 'should handle nested object values',
      input: {
        type: 'object',
        value: {
          type: 'string',
          value: 'nested value',
        },
      },
      expected: {
        id: 'object',
        type: 'object',
        name: undefined,
        value: undefined,
        children: [
          {
            id: 'object.string',
            type: 'string',
            name: undefined,
            value: 'nested value',
            children: undefined,
          },
        ],
      },
    },
    {
      name: 'should handle table items (array with key-value pairs)',
      input: [
        {type: 'string', value: 'key'},
        {type: 'string', value: 'value'},
      ],
      expected: {
        id: '.item.undefined',
        name: 'Table item #undefined',
        children: [
          {
            id: '.item.undefined.key',
            type: 'string',
            name: 'key',
            value: 'key',
            children: undefined,
          },
          {
            id: '.item.undefined.value',
            type: 'string',
            name: 'value',
            value: 'value',
            children: undefined,
          },
        ],
      },
    },
    {
      name: 'should handle complex nested structures',
      input: {
        type: 'object',
        value: {
          type: 'array',
          value: [
            {
              name: 'item1',
              type: 'string',
              value: 'value1',
            },
            {
              name: 'item2',
              type: 'integer',
              value: 42,
            },
          ],
        },
      },
      expected: {
        id: 'object',
        name: undefined,
        type: 'object',
        value: undefined,
        children: [
          {
            id: 'object.array',
            type: 'array',
            name: undefined,
            value: undefined,
            children: [
              {
                id: 'object.array.item1',
                type: 'string',
                name: 'item1',
                value: 'value1',
                children: undefined,
              },
              {
                id: 'object.array.item2',
                type: 'integer',
                name: 'item2',
                value: '42',
                children: undefined,
              },
            ],
          },
        ],
      },
    },
  ]

  testCases.forEach(({name, input, expected}) => {
    test(name, () => {
      const result = datumItemToTreeViewItem(input)
      expect(result).toEqual(expected)
    })
  })
})
