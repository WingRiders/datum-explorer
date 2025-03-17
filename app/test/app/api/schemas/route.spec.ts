import {describe, expect, test} from 'vitest'
import {GET as getSchemasResolver} from '../../../../src/app/api/schemas/route'

describe('/schemas route', () => {
  test('should return CDDL schemas for all projects', async () => {
    const response = getSchemasResolver()
    expect(await response.json()).toEqual({})
  })
})
