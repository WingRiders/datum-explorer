import type {ReadableDatum} from '@wingriders/datum-explorer-lib'
import {beforeEach, describe, expect, test, vi} from 'vitest'
import type {SchemasResponse} from '../../src/api/types'
import {DatumParsing} from '../../src/app/DatumParsing'
import {useParseCborQuery, useSchemaCddl} from '../../src/helpers/queries'
import {useLocalSchemasStore} from '../../src/store/localSchemas'
import {fireEvent, render, screen} from '../../test/utils'

vi.mock('../../src/helpers/queries', () => ({
  useSchemaCddl: vi.fn(),
  useParseCborQuery: vi.fn(),
}))

vi.mock('../../src/store/localSchemas', () => ({
  useLocalSchemasStore: vi.fn(),
}))

const mockRouter = {
  push: vi.fn(),
}
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}))

describe('DatumParsing', () => {
  const mockRemoteSchemas: SchemasResponse = {
    project1: [
      {
        filePath: 'project1/pool.cddl',
        rootTypeName: 'Pool',
      },
    ],
  }
  const mockSchemaCddl = 'Pool = []'

  let mockWorker: {
    postMessage: ReturnType<typeof vi.fn>
    onmessage: null | ((event: MessageEvent) => void)
    terminate: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.delete('schema')
    mockSearchParams.delete('local')
    mockSearchParams.delete('datum')

    mockWorker = {
      postMessage: vi.fn(),
      onmessage: null,
      terminate: vi.fn(),
    }
    vi.stubGlobal(
      'Worker',
      vi.fn().mockImplementation(() => mockWorker),
    )

    vi.mocked(useLocalSchemasStore).mockReturnValue({
      localSchemas: [],
      isRehydrated: true,
    })

    vi.mocked(useSchemaCddl).mockReturnValue({
      schemaCddl: mockSchemaCddl,
      isLoading: false,
    })

    const mockParsedDatum: ReadableDatum = {
      type: 'Pool',
      value: {
        type: 'record',
        value: [{name: 'amount', type: 'integer', value: 100}],
      },
    }
    vi.mocked(useParseCborQuery).mockReturnValue({
      data: mockParsedDatum,
      isLoading: false,
    } as any)
  })

  test('should render the component with schema selection and datum input', () => {
    render(<DatumParsing remoteSchemas={mockRemoteSchemas} />)

    expect(screen.getByRole('textbox', {name: 'Datum'})).toBeInTheDocument()
    expect(screen.getByText('Select schema and enter datum CBOR')).toBeInTheDocument()
  })

  test('should allow selecting a schema', async () => {
    render(<DatumParsing remoteSchemas={mockRemoteSchemas} />)

    const schemaSelect = screen.getByRole('combobox')
    fireEvent.mouseDown(schemaSelect)

    const remoteSchemaOption = screen.getByText('Pool')
    fireEvent.click(remoteSchemaOption)

    expect(mockRouter.push).toHaveBeenCalledWith('?schema=project1%2Fpool.cddl')
  })

  test('should allow entering datum CBOR and display parsed result', async () => {
    mockSearchParams.set('schema', 'project1/pool.cddl')
    mockSearchParams.set('datum', '8200')

    render(<DatumParsing remoteSchemas={mockRemoteSchemas} />)

    expect(screen.getByText('Pool')).toBeInTheDocument()
    expect(screen.getByText('amount: 100')).toBeInTheDocument()
  })

  test('should show loading state while fetching schema', async () => {
    mockSearchParams.set('schema', 'project1/pool.cddl')
    mockSearchParams.set('datum', '8200')

    vi.mocked(useSchemaCddl).mockReturnValue({
      schemaCddl: '',
      isLoading: true,
    })

    render(<DatumParsing remoteSchemas={mockRemoteSchemas} />)

    expect(screen.getByText('Loading schema')).toBeInTheDocument()
  })

  test('should show error state when parsing fails', async () => {
    mockSearchParams.set('schema', 'project1/pool.cddl')
    mockSearchParams.set('datum', '8200')

    vi.mocked(useParseCborQuery).mockReturnValue({
      data: undefined,
      error: new Error('Failed to parse CBOR'),
      isLoading: false,
      isError: true,
    } as any)

    render(<DatumParsing remoteSchemas={mockRemoteSchemas} />)

    expect(screen.getByText('Error while parsing datum')).toBeInTheDocument()
    expect(screen.getByText('Failed to parse CBOR')).toBeInTheDocument()
  })
})
