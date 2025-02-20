export class GitHubFetchError extends Error {
  constructor(queryName: string, responseStatus: number) {
    super(`GitHub fetch error for query: ${queryName}, response status: ${responseStatus}`)
  }
}
