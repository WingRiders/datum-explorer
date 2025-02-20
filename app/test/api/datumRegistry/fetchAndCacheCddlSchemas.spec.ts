import nock from 'nock'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import {
  deleteAllProjectsFromCddlSchemasCache,
  getAllCddlSchemasFromCache,
} from '../../../src/api/datumRegistry/cddlSchemasCache'
import {GitHubFetchError} from '../../../src/api/datumRegistry/errors'
import {fetchAndCacheCddlSchemas} from '../../../src/api/datumRegistry/fetchAndCacheCddlSchemas'

describe('fetchAndCacheCddlSchemas (integration test)', () => {
  beforeEach(() => {
    nock.cleanAll()
    deleteAllProjectsFromCddlSchemasCache()
  })

  afterEach(() => {
    expect(nock.isDone()).toBe(true) // Ensure all mocked requests were made
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
              {name: 'schema1.cddl', object: {text: 'schema content 1'}},
              {name: 'schema2.cddl', object: {text: 'schema content 2'}},
            ],
          },
          p1: {
            entries: [{name: 'schema3.cddl', object: {text: 'schema content 3'}}],
          },
        },
      },
    }

    // Mock the GraphQL requests
    nock('https://api.github.com')
      .post('/graphql', /query ProjectsFolder/)
      .reply(200, projectResponse)
      .post('/graphql', /query CddlFiles.*oid1.*oid2/)
      .reply(200, schemasResponse)

    await fetchAndCacheCddlSchemas()

    const cache = getAllCddlSchemasFromCache()

    expect(cache).toEqual({
      project1: {
        projectGithubOid: 'oid1',
        schemas: {
          'schema1.cddl': {cddl: 'schema content 1'},
          'schema2.cddl': {cddl: 'schema content 2'},
        },
      },
      project2: {
        projectGithubOid: 'oid2',
        schemas: {
          'schema3.cddl': {cddl: 'schema content 3'},
        },
      },
    })
  })

  it('should throw an error if GitHub GraphQL API returns 403', async () => {
    nock('https://api.github.com').post('/graphql').reply(403, {message: 'Forbidden'})

    await expect(fetchAndCacheCddlSchemas()).rejects.toThrow(GitHubFetchError)

    const cache = getAllCddlSchemasFromCache()
    expect(cache).toEqual({}) // Ensure cache remains unchanged
  })
})
