import type {ReadableDatum} from '@wingriders/datum-explorer-lib'
import {describe, expect, it} from 'vitest'
import {DatumDisplay} from '../../../src/components/DatumDisplay/DatumDisplay'
import {render, screen} from '../../../test/utils'

describe('DatumDisplay', () => {
  it('renders a simple datum with primitive value', () => {
    const simpleDatum: ReadableDatum = {
      type: 'string',
      value: 'Hello World',
    }

    render(<DatumDisplay datum={simpleDatum} />)

    expect(screen.getByText('string')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('renders a nested datum with object value', () => {
    const nestedDatum: ReadableDatum = {
      type: 'object',
      value: {
        type: 'person',
        value: [
          {
            name: 'name',
            type: 'string',
            value: 'John Doe',
          },
          {
            name: 'age',
            type: 'integer',
            value: 30,
          },
        ],
      },
    }

    render(<DatumDisplay datum={nestedDatum} />)

    expect(screen.getByText('object')).toBeInTheDocument()
    expect(screen.getByText('person')).toBeInTheDocument()
    expect(screen.getByText('name: John Doe')).toBeInTheDocument()
    expect(screen.getByText('age: 30')).toBeInTheDocument()
    expect(screen.getByText('string')).toBeInTheDocument()
    expect(screen.getByText('integer')).toBeInTheDocument()
  })

  it('renders an array datum', () => {
    const arrayDatum: ReadableDatum = {
      type: 'array',
      value: [
        {
          type: 'string',
          value: 'Item 1',
        },
        {
          type: 'string',
          value: 'Item 2',
        },
      ],
    }

    render(<DatumDisplay datum={arrayDatum} />)

    expect(screen.getByText('array')).toBeInTheDocument()
    expect(screen.getByText('Array item #0: Item 1')).toBeInTheDocument()
    expect(screen.getByText('Array item #1: Item 2')).toBeInTheDocument()
    expect(screen.getAllByText('string').length).toBe(2)
  })

  it('renders a complex datum with mixed types', () => {
    const complexDatum: ReadableDatum = {
      type: 'transaction',
      value: {
        type: 'record1',
        value: [
          {
            name: 'id',
            type: 'hash',
            value: 'abc123def456',
          },
          {
            name: 'inputs',
            type: 'array',
            value: [
              {
                type: 'input',
                value: {
                  type: 'record2',
                  value: [
                    {
                      name: 'address',
                      type: 'string',
                      value: 'addr1qxyz',
                    },
                    {
                      name: 'amount',
                      type: 'integer',
                      value: 100,
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    }

    render(<DatumDisplay datum={complexDatum} />)

    expect(screen.getByText('transaction')).toBeInTheDocument()
    expect(screen.getByText('record1')).toBeInTheDocument()
    expect(screen.getByText('record2')).toBeInTheDocument()
    expect(screen.getByText('id: abc123def456')).toBeInTheDocument()
    expect(screen.getByText('hash')).toBeInTheDocument()
    expect(screen.getByText('inputs')).toBeInTheDocument()
    expect(screen.getByText('array')).toBeInTheDocument()
    expect(screen.getByText('input')).toBeInTheDocument()
    expect(screen.getByText('address: addr1qxyz')).toBeInTheDocument()
    expect(screen.getByText('amount: 100')).toBeInTheDocument()
  })

  it('handles empty arrays correctly', () => {
    const emptyArrayDatum: ReadableDatum = {
      type: 'array',
      value: [],
    }

    render(<DatumDisplay datum={emptyArrayDatum} />)

    expect(screen.getByText('array')).toBeInTheDocument()
    expect(screen.getByText('[]')).toBeInTheDocument()
  })

  it('displays correct label for items with name and value', () => {
    const datum: ReadableDatum = {
      type: 'object',
      value: {
        type: 'record',
        value: [
          {
            name: 'config',
            type: 'string',
            value: 'default',
          },
        ],
      },
    }

    render(<DatumDisplay datum={datum} />)

    expect(screen.getByText('object')).toBeInTheDocument()
    expect(screen.getByText('record')).toBeInTheDocument()
    expect(screen.getByText('config: default')).toBeInTheDocument()
    expect(screen.getByText('string')).toBeInTheDocument()
  })
})
