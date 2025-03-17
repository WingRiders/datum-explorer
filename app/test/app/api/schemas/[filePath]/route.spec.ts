import {describe, expect, test} from 'vitest'
import {GET as getSchemaResolver} from '../../../../../src/app/api/schemas/[filePath]/route'

describe('/schemas/[filePath] route', () => {
  test('should return CDDL schema for the given file path', async () => {
    const response = await getSchemaResolver(undefined, {
      params: Promise.resolve({filePath: 'wingriders/v2Pool'}),
    })
    expect(await response.json()).toEqual({cddl: 'wingriders/v2Pool'})
  })
})
