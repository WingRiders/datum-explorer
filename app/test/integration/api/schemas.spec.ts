import {expect, it} from 'bun:test'
import {
  deleteAllProjectsFromCddlSchemasCache,
  getAllCddlSchemasFromCache,
} from '../../../src/api/datumRegistry/cddlSchemasCache'
import {fetchAndCacheCddlSchemas} from '../../../src/api/datumRegistry/fetchAndCacheCddlSchemas'
import {GET as getSchemaEndpoint} from '../../../src/app/api/schemas/[filePath]/route'
import {GET as getSchemasEndpoint} from '../../../src/app/api/schemas/route'
import {clearFetchMocks, mockFetch, mockFetchIsDone} from '../../helpers/mockFetch'

const getSchemas = async () => {
  const response = await getSchemasEndpoint()
  return {status: response.status, json: await response.json()}
}

const getSchema = async (filePath: string) => {
  const response = await getSchemaEndpoint(
    new Request(`http://localhost:3000/api/schemas/${filePath}`),
    {
      params: Promise.resolve({filePath}),
    },
  )
  return {status: response.status, json: await response.json()}
}

const mockNoProjectsFetch = () => {
  mockFetch(
    {url: 'https://api.github.com/graphql', method: 'POST', bodyMatcher: /query ProjectsFolder/},
    {body: {data: {repository: {projects: {entries: []}}}}},
  )
}

it('should handle schema changes across multiple fetch calls and validate API responses', async () => {
  deleteAllProjectsFromCddlSchemasCache()

  // Check that cache is empty if no projects to fetch
  mockNoProjectsFetch()
  await fetchAndCacheCddlSchemas()
  expect(getAllCddlSchemasFromCache()).toEqual({})

  // Validate API response for empty cache
  mockNoProjectsFetch() // mock fetch because getSchemas calls fetchAndCacheCddlSchemas if cache is empty
  expect(await getSchemas()).toEqual({status: 200, json: {}})

  mockNoProjectsFetch() // mock fetch because getSchema calls fetchAndCacheCddlSchemas if cache is empty
  // Cache is empty, so schema1.cddl is not found
  expect(await getSchema('project1/schema1.cddl')).toEqual({
    status: 404,
    json: {message: 'project1/schema1.cddl schema not found among cached schemas'},
  })

  // Two projects added with schemas
  mockFetch(
    {url: 'https://api.github.com/graphql', method: 'POST', bodyMatcher: /query ProjectsFolder/},
    {
      body: {
        data: {
          repository: {
            projects: {
              entries: [
                {name: 'project1', oid: 'oid1'},
                {name: 'project2', oid: 'oid2'},
              ],
            },
          },
        },
      },
    },
  )
  mockFetch(
    {
      url: 'https://api.github.com/graphql',
      method: 'POST',
      bodyMatcher: /query CddlFiles.*oid1.*oid2/,
    },
    {
      body: {
        data: {
          repository: {
            p0: {
              entries: [
                {name: 'schema1.cddl', object: {text: 'Pool = []'}},
                {name: 'schema2.cddl', object: {text: 'Request = []'}},
              ],
            },
            p1: {
              entries: [{name: 'schema3.cddl', object: {text: 'Order = []'}}],
            },
          },
        },
      },
    },
  )

  // Validate cache after changes
  await fetchAndCacheCddlSchemas()
  expect(getAllCddlSchemasFromCache()).toEqual({
    project1: {
      projectGithubOid: 'oid1',
      schemas: {
        'schema1.cddl': {cddl: 'Pool = []', rootTypeName: 'Pool'},
        'schema2.cddl': {cddl: 'Request = []', rootTypeName: 'Request'},
      },
    },
    project2: {
      projectGithubOid: 'oid2',
      schemas: {
        'schema3.cddl': {cddl: 'Order = []', rootTypeName: 'Order'},
      },
    },
  })

  // Validate API responses after schemas are cached
  expect(await getSchemas()).toEqual({
    status: 200,
    json: {
      project1: [
        {filePath: 'project1/schema1.cddl', rootTypeName: 'Pool'},
        {filePath: 'project1/schema2.cddl', rootTypeName: 'Request'},
      ],
      project2: [{filePath: 'project2/schema3.cddl', rootTypeName: 'Order'}],
    },
  })
  expect(await getSchema('project1/schema1.cddl')).toEqual({
    status: 200,
    json: {cddl: 'Pool = []'},
  })
  expect(await getSchema('project2/schema3.cddl')).toEqual({
    status: 200,
    json: {cddl: 'Order = []'},
  })

  // Second fetch: project1 has a new schema, schema1.cddl is changed, and project2 is removed
  mockFetch(
    {url: 'https://api.github.com/graphql', method: 'POST', bodyMatcher: /query ProjectsFolder/},
    {
      body: {
        data: {
          repository: {
            projects: {
              entries: [{name: 'project1', oid: 'newOid1'}], // project2 is removed
            },
          },
        },
      },
    },
  )
  mockFetch(
    {
      url: 'https://api.github.com/graphql',
      method: 'POST',
      bodyMatcher: /query CddlFiles.*newOid1/,
    },
    {
      body: {
        data: {
          repository: {
            p0: {
              entries: [
                {name: 'schema1.cddl', object: {text: 'PoolV2 = []'}}, // schema1 is updated
                {name: 'schema4.cddl', object: {text: 'RequestV2 = []'}}, // schema4 is new
              ],
            },
          },
        },
      },
    },
  )

  // Validate cache after changes
  await fetchAndCacheCddlSchemas()
  expect(getAllCddlSchemasFromCache()).toEqual({
    project1: {
      projectGithubOid: 'newOid1',
      schemas: {
        'schema1.cddl': {cddl: 'PoolV2 = []', rootTypeName: 'PoolV2'},
        'schema4.cddl': {cddl: 'RequestV2 = []', rootTypeName: 'RequestV2'},
      },
    },
  })

  // Validate API responses after changes
  expect(await getSchemas()).toEqual({
    status: 200,
    json: {
      project1: [
        {filePath: 'project1/schema1.cddl', rootTypeName: 'PoolV2'},
        {filePath: 'project1/schema4.cddl', rootTypeName: 'RequestV2'},
      ],
    },
  })
  expect(await getSchema('project1/schema1.cddl')).toEqual({
    status: 200,
    json: {cddl: 'PoolV2 = []'},
  })
  expect(await getSchema('project1/schema4.cddl')).toEqual({
    status: 200,
    json: {cddl: 'RequestV2 = []'},
  })
  expect(await getSchema('project2/schema3.cddl')).toEqual({
    status: 404,
    json: {message: 'project2/schema3.cddl schema not found among cached schemas'},
  })

  // Check that all mocked fetches are done
  expect(mockFetchIsDone()).toBeTrue()

  clearFetchMocks()
})
