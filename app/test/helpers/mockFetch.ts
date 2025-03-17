import {expect} from 'bun:test'

export type MockResponse = {
  body: object | string
  status?: number
}

export type MockRequestOptions = {
  url: string
  method: string
  bodyMatcher?: RegExp
}

const mockedRequests: {mockRequestOptions: MockRequestOptions; response: MockResponse}[] = []

let originalFetch: typeof fetch | null = null

const mockedFetch: typeof fetch = async (requestInfo: RequestInfo, opts: RequestInit) => {
  expect(mockedRequests).not.toBeEmpty()
  const {mockRequestOptions, response} = mockedRequests.shift()
  expect(requestInfo.toString()).toBe(mockRequestOptions.url)
  expect(opts.method).toBe(mockRequestOptions.method)
  if (mockRequestOptions.bodyMatcher != null) {
    expect(opts.body).toBeDefined()
    expect(opts.body).toMatch(mockRequestOptions.bodyMatcher)
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
}

export const mockFetch = (mockedRequestsOptions: MockRequestOptions, response: MockResponse) => {
  if (originalFetch == null) {
    originalFetch = globalThis.fetch
    global.fetch = mockedFetch
  }
  mockedRequests.push({mockRequestOptions: mockedRequestsOptions, response})
}

export const mockFetchIsDone = mockedRequests.length === 0

export const clearFetchMocks = () => {
  mockedRequests.length = 0
  if (originalFetch != null) {
    globalThis.fetch = originalFetch
    originalFetch = null
  }
}
