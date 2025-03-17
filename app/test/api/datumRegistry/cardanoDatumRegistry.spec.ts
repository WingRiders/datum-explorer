import nock from 'nock'
import {afterEach, describe, expect, it} from 'vitest'
import {
  fetchProjectsFromDatumRegistry,
  fetchSchemasForProjectsFromDatumRegistry,
} from '../../../src/api/datumRegistry/cardanoDatumRegistry'
import {GitHubFetchError} from '../../../src/api/datumRegistry/errors'

const mockProjectFolders = [
  {oid: 'abc123', name: 'Project1'},
  {oid: 'def456', name: 'Project2'},
]

describe('fetchProjectsFromDatumRegistry', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  it('should fetch project folders from GitHub', async () => {
    const mockResponse = {
      data: {
        repository: {
          projects: {
            entries: mockProjectFolders,
          },
        },
      },
    }

    nock('https://api.github.com').post('/graphql').reply(200, mockResponse)

    const result = await fetchProjectsFromDatumRegistry()

    expect(result).toEqual(mockProjectFolders)
  })

  it('should throw GitHubFetchError on ClientError', async () => {
    nock('https://api.github.com').post('/graphql').reply(403, {message: 'Forbidden'})

    await expect(fetchProjectsFromDatumRegistry()).rejects.toThrow(GitHubFetchError)
  })
})

describe('fetchSchemasForProjectsFromDatumRegistry', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  it('should fetch CDDL schemas for given project folders', async () => {
    const mockResponse = {
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

    nock('https://api.github.com').post('/graphql').reply(200, mockResponse)

    const result = await fetchSchemasForProjectsFromDatumRegistry(mockProjectFolders)

    expect(result).toEqual([
      {
        projectName: 'Project1',
        projectGithubOid: 'abc123',
        fileName: 'schema1.cddl',
        cddl: 'schema content 1',
      },
      {
        projectName: 'Project1',
        projectGithubOid: 'abc123',
        fileName: 'schema2.cddl',
        cddl: 'schema content 2',
      },
      {
        projectName: 'Project2',
        projectGithubOid: 'def456',
        fileName: 'schema3.cddl',
        cddl: 'schema content 3',
      },
    ])
  })

  it('should throw GitHubFetchError on ClientError', async () => {
    nock('https://api.github.com').post('/graphql').reply(403, {message: 'Forbidden'})

    await expect(fetchSchemasForProjectsFromDatumRegistry(mockProjectFolders)).rejects.toThrow(
      GitHubFetchError,
    )
  })

  it('should return an empty array if no project folders are provided', async () => {
    const result = await fetchSchemasForProjectsFromDatumRegistry([])
    expect(result).toEqual([])
  })
})
