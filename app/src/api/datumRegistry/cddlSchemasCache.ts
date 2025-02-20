import {isEmpty} from 'lodash'

type CddlSchemaRecords = {
  [fileName: string]: {
    cddl: string
    rootTypeName: string
  }
}

const cddlSchemasCache: {
  [projectName: string]: {
    projectGithubOid: string
    schemas: CddlSchemaRecords
  }
} = {}

export const addProjectToCddlSchemasCache = (
  projectName: string,
  projectGithubOid: string,
  schemas: CddlSchemaRecords,
) => {
  cddlSchemasCache[projectName] = {
    projectGithubOid,
    schemas,
  }
}

export const deleteProjectFromCddlSchemasCache = (projectName: string) => {
  delete cddlSchemasCache[projectName]
}

export const getAllCddlSchemasFromCache = () => cddlSchemasCache

export const deleteAllProjectsFromCddlSchemasCache = () =>
  Object.keys(cddlSchemasCache).forEach(deleteProjectFromCddlSchemasCache)

export const getCddlSchema = (projectName: string, fileName: string) =>
  cddlSchemasCache[projectName]?.schemas[fileName]

export const isCddlSchemasCacheEmpty = () => isEmpty(cddlSchemasCache)
