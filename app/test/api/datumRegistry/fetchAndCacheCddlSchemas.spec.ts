import {afterEach, beforeEach, describe, expect, it} from 'bun:test'
import {
  deleteAllProjectsFromCddlSchemasCache,
  getAllCddlSchemasFromCache,
} from '../../../src/api/datumRegistry/cddlSchemasCache'
import {GitHubFetchError} from '../../../src/api/datumRegistry/errors'
import {fetchAndCacheCddlSchemas} from '../../../src/api/datumRegistry/fetchAndCacheCddlSchemas'
import {clearFetchMocks, mockFetch, mockFetchIsDone} from '../../helpers/mockFetch'

describe('fetchAndCacheCddlSchemas (integration test)', () => {
  beforeEach(() => {
    clearFetchMocks()
    deleteAllProjectsFromCddlSchemasCache()
  })

  afterEach(() => {
    expect(mockFetchIsDone).toBeTrue()
  })

  it('should fetch and cache new schemas based on GitHub GraphQL responses', async () => {
    // Mock the response for fetching projects
    const projectResponse = {
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
    }

    const schemasResponse = {
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
    }

    mockFetch(
      {url: 'https://api.github.com/graphql', method: 'POST', bodyMatcher: /query ProjectsFolder/},
      {body: projectResponse},
    )
    mockFetch(
      {
        url: 'https://api.github.com/graphql',
        method: 'POST',
        bodyMatcher: /query CddlFiles.*oid1.*oid2/,
      },
      {body: schemasResponse},
    )

    await fetchAndCacheCddlSchemas()

    const cache = getAllCddlSchemasFromCache()

    expect(cache).toEqual({
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
  })

  it('should handle schema changes, additions, and removals across multiple fetch calls', async () => {
    // Initial fetch with no projects
    mockFetch(
      {url: 'https://api.github.com/graphql', method: 'POST', bodyMatcher: /query ProjectsFolder/},
      {body: {data: {repository: {projects: {entries: []}}}}},
    )

    await fetchAndCacheCddlSchemas()

    let cache = getAllCddlSchemasFromCache()
    expect(cache).toEqual({})

    // Two projects added with total three schemas
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

    await fetchAndCacheCddlSchemas()

    cache = getAllCddlSchemasFromCache()
    expect(cache).toEqual({
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

    await fetchAndCacheCddlSchemas()

    cache = getAllCddlSchemasFromCache()
    expect(cache).toEqual({
      project1: {
        projectGithubOid: 'newOid1',
        schemas: {
          'schema1.cddl': {cddl: 'PoolV2 = []', rootTypeName: 'PoolV2'},
          'schema4.cddl': {cddl: 'RequestV2 = []', rootTypeName: 'RequestV2'},
        },
      },
    })
  })

  it('should throw an error and keep the cache unchanged if GitHub returns a 500 error', async () => {
    // Initial fetch with some valid data
    mockFetch(
      {url: 'https://api.github.com/graphql', method: 'POST', bodyMatcher: /query ProjectsFolder/},
      {
        body: {
          data: {
            repository: {
              projects: {
                entries: [{name: 'project1', oid: 'oid1'}],
              },
            },
          },
        },
      },
    )
    mockFetch(
      {url: 'https://api.github.com/graphql', method: 'POST', bodyMatcher: /query CddlFiles.*oid1/},
      {
        body: {
          data: {
            repository: {
              p0: {
                entries: [{name: 'schema1.cddl', object: {text: 'Pool = []'}}],
              },
            },
          },
        },
      },
    )

    await fetchAndCacheCddlSchemas()

    const initialCache = getAllCddlSchemasFromCache()
    expect(initialCache).toEqual({
      project1: {
        projectGithubOid: 'oid1',
        schemas: {
          'schema1.cddl': {cddl: 'Pool = []', rootTypeName: 'Pool'},
        },
      },
    })

    // Second fetch: GitHub returns a 500 error
    mockFetch(
      {url: 'https://api.github.com/graphql', method: 'POST'},
      {status: 500, body: {message: 'Internal Server Error'}},
    )

    await expect(fetchAndCacheCddlSchemas()).rejects.toThrow(GitHubFetchError)

    const cacheAfterError = getAllCddlSchemasFromCache()
    expect(cacheAfterError).toEqual(initialCache) // Cache should remain unchanged
  })

  it('should throw an error if GitHub GraphQL API returns 403', async () => {
    mockFetch(
      {url: 'https://api.github.com/graphql', method: 'POST'},
      {status: 403, body: {message: 'Forbidden'}},
    )

    await expect(fetchAndCacheCddlSchemas()).rejects.toThrow(GitHubFetchError)

    const cache = getAllCddlSchemasFromCache()
    expect(cache).toEqual({}) // Ensure cache remains unchanged
  })
})
