import {beforeEach, describe, expect, test} from 'bun:test'
import {
  addProjectToCddlSchemasCache,
  deleteAllProjectsFromCddlSchemasCache,
} from '../../../../../src/api/datumRegistry/cddlSchemasCache'
import {GET as getSchemaResolver} from '../../../../../src/app/api/schemas/[filePath]/route'
import {clearFetchMocks, mockFetch} from '../../../../helpers/mockFetch'

describe('/schemas/[filePath] route', () => {
  beforeEach(() => {
    clearFetchMocks()
    deleteAllProjectsFromCddlSchemasCache()
  })

  test('should return CDDL schema for the given file path', async () => {
    // create and add mock project to the cache
    const project1 = {
      name: 'project1',
      oid: '123abc',
      schemas: {
        'schema1.cddl': {cddl: 'Pool = []', rootTypeName: 'Pool'},
      },
    }
    addProjectToCddlSchemasCache(project1.name, project1.oid, project1.schemas)

    const response = await getSchemaResolver(new Request('http://localhost'), {
      params: Promise.resolve({filePath: 'project1/schema1.cddl'}),
    })
    expect(await response.json()).toEqual({cddl: 'Pool = []'})
  })

  test('should return 404 if the schema is not found', async () => {
    // create and add mock project to the cache
    const project1 = {
      name: 'project1',
      oid: '123abc',
      schemas: {
        'schema1.cddl': {cddl: 'Pool = []', rootTypeName: 'Pool'},
      },
    }
    addProjectToCddlSchemasCache(project1.name, project1.oid, project1.schemas)

    // request a schema that not in the cache
    const response = await getSchemaResolver(new Request('http://localhost'), {
      params: Promise.resolve({filePath: 'project2/schema2.cddl'}),
    })
    expect(response.status).toBe(404)
  })

  test('should return 500 if there is an error fetching the schema', async () => {
    mockFetch(
      {url: 'https://api.github.com/graphql', method: 'POST'},
      {status: 403, body: {message: 'Forbidden'}},
    )
    const response = await getSchemaResolver(new Request('http://localhost'), {
      params: Promise.resolve({filePath: 'project1/schema1.cddl'}),
    })
    expect(response.status).toBe(500)
  })
})
