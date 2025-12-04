import {expect} from 'vitest'

export type MockResponse = {
  body: object | string
  status?: number
}

export type MockRequestOptions = {
  url: string
  method: string
  bodyMatcher?: RegExp
}

const mockedRequests: {
  mockRequestOptions: MockRequestOptions
  response: MockResponse
}[] = []

let originalFetch: typeof fetch | null = null

const mockedFetch: typeof fetch = (async (requestInfo, opts) => {
  const url =
    typeof requestInfo === 'string'
      ? requestInfo
      : requestInfo instanceof URL
        ? requestInfo.href
        : requestInfo.url
  const hostname = new URL(url).hostname

  // Allow requests to localhost without mocking
  if (hostname === 'localhost') {
    if (originalFetch == null) throw new Error('Called mockedFetch while originalFetch is null')
    return originalFetch(requestInfo, opts)
  }
  if (mockedRequests.length === 0)
    throw new Error(`Cannot fetch from ${requestInfo}, it's not mocked`)
  const {mockRequestOptions, response} = mockedRequests.shift()!
  expect(requestInfo.toString()).toBe(mockRequestOptions.url)
  expect(opts?.method).toBe(mockRequestOptions.method)
  if (mockRequestOptions.bodyMatcher != null) {
    expect(opts?.body).toBeDefined()
    expect(opts?.body).toMatch(mockRequestOptions.bodyMatcher)
  }

  const {body, status = 200} = response
  if (typeof body === 'string') {
    return new Response(body, {status})
  }
  if (typeof body === 'object') {
    return new Response(JSON.stringify(response.body), {
      status,
      headers: {'Content-Type': 'application/json'},
    })
  }
  throw new Error(`Unsupported response body type: ${typeof body}`)
}) as typeof fetch

export const mockFetch = (mockedRequestsOptions: MockRequestOptions, response: MockResponse) => {
  if (originalFetch == null) {
    originalFetch = globalThis.fetch
    global.fetch = mockedFetch
  }
  mockedRequests.push({mockRequestOptions: mockedRequestsOptions, response})
}

export const mockFetchIsDone = () => mockedRequests.length === 0

export const clearFetchMocks = () => {
  mockedRequests.length = 0
  if (originalFetch != null) {
    globalThis.fetch = originalFetch
    originalFetch = null
  }
}
