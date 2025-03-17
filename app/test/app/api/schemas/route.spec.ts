import {beforeEach, describe, expect, test} from 'vitest'
import {
  addProjectToCddlSchemasCache,
  deleteAllProjectsFromCddlSchemasCache,
} from '../../../../src/api/datumRegistry/cddlSchemasCache'
import {GET as getSchemasResolver} from '../../../../src/app/api/schemas/route'
import {clearFetchMocks, mockFetch} from '../../../helpers/mockFetch'

describe('/schemas route', () => {
  beforeEach(() => {
    clearFetchMocks()
    deleteAllProjectsFromCddlSchemasCache()
  })

  test('should return CDDL schemas for all projects', async () => {
    // create and add mock projects to the cache
    const project1 = {
      name: 'project1',
      oid: '123abc',
      schemas: {
        'schema1.cddl': {cddl: 'Pool = []', rootTypeName: 'Pool'},
        'schema2.cddl': {cddl: 'Request = []', rootTypeName: 'Request'},
      },
    }
    const project2 = {
      name: 'project2',
      oid: '456def',
      schemas: {'schema2.cddl': {cddl: 'Order = []', rootTypeName: 'Order'}},
    }
    addProjectToCddlSchemasCache(project1.name, project1.oid, project1.schemas)
    addProjectToCddlSchemasCache(project2.name, project2.oid, project2.schemas)

    const response = await getSchemasResolver()
    expect(await response.json()).toEqual({
      project1: [
        {
          filePath: 'project1/schema1.cddl',
          rootTypeName: 'Pool',
        },
        {
          filePath: 'project1/schema2.cddl',
          rootTypeName: 'Request',
        },
      ],
      project2: [
        {
          filePath: 'project2/schema2.cddl',
          rootTypeName: 'Order',
        },
      ],
    })
  })

  test("should return 500 if there's an error fetching CDDL schemas", async () => {
    mockFetch(
      {url: 'https://api.github.com/graphql', method: 'POST'},
      {status: 403, body: {message: 'Forbidden'}},
    )
    const response = await getSchemasResolver()
    expect(response.status).toBe(500)
  })
})
