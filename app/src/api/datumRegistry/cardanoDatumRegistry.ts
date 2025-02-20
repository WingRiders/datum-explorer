import {ClientError, GraphQLClient, gql} from 'graphql-request'
import {chunk} from 'lodash'
import {config} from '../../config'
import {GitHubFetchError} from './errors'

const MAX_PROJECTS_IN_ONE_REQUEST = 100
const REQUEST_TIMEOUT = 60 * 1000 // 1 minute

const githubGqlUrl = 'https://api.github.com/graphql'
const gqlClient = config.GITHUB_AUTH_TOKEN
  ? new GraphQLClient(githubGqlUrl, {
      headers: {Authorization: `Bearer ${config.GITHUB_AUTH_TOKEN}`},
      // Add AbortSignal to the request with a specified timeout
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, {...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT)}),
    })
  : null

const projectsFolderGqlQuery = gql`
query ProjectsFolder($repositoryOwner: String!, $repositoryName: String!, $projectsFolderPath: String!) {
  repository(owner: $repositoryOwner, name: $repositoryName) {
    projects: object(expression: $projectsFolderPath) {
      ... on Tree {
        entries {
          oid
          name
        }
      }
    }
  }
}
`

type ProjectFolder = {oid: string; name: string}

type ProjectsFolderQueryResponse = {
  repository: {
    projects: {
      entries: ProjectFolder[]
    }
  }
}

/**
 * Fetch all project names and oids from the Datum Registry using Github GraphQL API.
 * If the gqlClient is not initialized, return mocked data.
 *
 * Throws an error if fetching from Github fails.
 */
export const fetchProjectsFromDatumRegistry = async (): Promise<ProjectFolder[]> => {
  if (gqlClient == null) return [{oid: 'oid1', name: 'wingriders'}]
  const gqlVariables = {
    repositoryOwner: config.REPOSITORY_OWNER,
    repositoryName: config.REPOSITORY_NAME,
    projectsFolderPath: `${config.REPOSITORY_BRANCH}:${config.REPOSITORY_PROJECTS_DIR}`,
  }
  try {
    const response: ProjectsFolderQueryResponse = await gqlClient.request(
      projectsFolderGqlQuery,
      gqlVariables,
    )
    return response.repository.projects.entries
  } catch (e) {
    if (e instanceof ClientError) {
      throw new GitHubFetchError('ProjectsFolder', e.response.status)
    }
    if (e instanceof Error) {
      throw new Error(`Failed to fetch projects folder from Github: ${e.name}(${e.message})`)
    }
    throw new Error('Failed to fetch projects folder from Github')
  }
}

const projectGqlAlias = (index: number) => `p${index}`

const getIndexByProjectGqlAlias = (projectGqlAlias: string): number =>
  Number(projectGqlAlias.slice(1))

const cddlFilesFragmentGql = gql`
fragment CddlFilesFragmentGql on Tree {
  entries {
    name
    object {
      ... on Blob {
        text
      }
    }
  }
}
`

const buildCddlFilesGqlQuery = (projectFolders: ProjectFolder[]): string => {
  return gql`
query CddlFiles($repositoryOwner: String!, $repositoryName: String!) {
  repository(owner: $repositoryOwner, name: $repositoryName) {
    ${projectFolders.map(({oid}, index) => `${projectGqlAlias(index)}: object(oid: "${oid}"){...CddlFilesFragmentGql}`).join('\n    ')}
  }
}
${cddlFilesFragmentGql}
`
}

type CddlFilesQueryResponse = {
  repository: {
    [projectName: string]: {
      entries: {
        name: string
        object: {
          text: string
        }
      }[]
    }
  }
}

export type CddlSchema = {
  projectName: string
  projectGithubOid: string
  fileName: string
  cddl: string
}

/**
 * Fetch cddl schemas for given projects from the Datum Registry using Github GraphQL API.
 * If the gqlClient is not initialized, return mocked data.
 *
 * Throws an error if fetching from Github fails.
 */
export const fetchSchemasForProjectsFromDatumRegistry = async (
  projectFolders: ProjectFolder[],
): Promise<CddlSchema[]> => {
  if (projectFolders.length === 0) {
    // No projects to fetch
    return []
  }
  if (gqlClient == null) {
    return projectFolders.map((projectFolder, index) => ({
      projectName: projectFolder.name,
      projectGithubOid: projectFolder.oid,
      fileName: `schema${index}.cddl`,
      cddl: `Type${index} = []`,
    }))
  }

  const gqlVariables = {
    repositoryOwner: config.REPOSITORY_OWNER,
    repositoryName: config.REPOSITORY_NAME,
  }
  const cddlSchemas: CddlSchema[] = []
  for (const projectFoldersChunk of chunk(projectFolders, MAX_PROJECTS_IN_ONE_REQUEST)) {
    const gqlQuery = buildCddlFilesGqlQuery(projectFoldersChunk)
    try {
      const response: CddlFilesQueryResponse = await gqlClient.request(gqlQuery, gqlVariables)
      cddlSchemas.push(
        ...Object.entries(response.repository).flatMap(([projectGqlAlias, {entries}]) => {
          const project = projectFoldersChunk[getIndexByProjectGqlAlias(projectGqlAlias)]
          return entries.map(({name, object: {text}}) => ({
            projectName: project.name,
            projectGithubOid: project.oid,
            fileName: name,
            cddl: text,
          }))
        }),
      )
    } catch (e) {
      if (e instanceof ClientError) {
        throw new GitHubFetchError('CddlFiles', e.response.status)
      }
      if (e instanceof Error) {
        throw new Error(`Failed to fetch cddl files from Github: ${e.name}(${e.message})`)
      }
      throw new Error('Failed to fetch cddl files from Github')
    }
  }
  return cddlSchemas
}
