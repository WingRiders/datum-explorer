import {sum} from 'lodash'
import {getAllCddlSchemasFromCache} from '../../../api/datumRegistry/cddlSchemasCache'

export const GET = () => {
  const cache = getAllCddlSchemasFromCache()
  return Response.json({
    healthy: true,
    projects: Object.keys(cache).length,
    schemas: sum(Object.values(cache).flatMap(({schemas}) => Object.keys(schemas).length)),
  })
}
