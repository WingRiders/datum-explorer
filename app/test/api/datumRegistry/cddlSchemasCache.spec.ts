import {beforeEach, describe, expect, it} from 'bun:test'
import {
  addProjectToCddlSchemasCache,
  deleteAllProjectsFromCddlSchemasCache,
  deleteProjectFromCddlSchemasCache,
  getAllCddlSchemasFromCache,
} from '../../../src/api/datumRegistry/cddlSchemasCache'

describe('cddlSchemasCache', () => {
  beforeEach(() => {
    // Clear the cache before each test
    deleteAllProjectsFromCddlSchemasCache()
  })

  it('should add a project to the cache', () => {
    const projectName = 'project1'
    const projectGithubOid = '123abc'
    const schemas = {
      'schema1.cddl': {cddl: 'Pool = []', rootTypeName: 'Pool'},
      'schema2.cddl': {cddl: 'Request = []', rootTypeName: 'Request'},
    }

    addProjectToCddlSchemasCache(projectName, projectGithubOid, schemas)
    const cache = getAllCddlSchemasFromCache()

    expect(cache[projectName]).toEqual({
      projectGithubOid,
      schemas,
    })
  })

  it('should delete a project from the cache', () => {
    const projectName = 'project1'
    const projectGithubOid = '123abc'
    const schemas = {'schema1.cddl': {cddl: 'Pool = []', rootTypeName: 'Pool'}}

    addProjectToCddlSchemasCache(projectName, projectGithubOid, schemas)
    deleteProjectFromCddlSchemasCache(projectName)
    const cache = getAllCddlSchemasFromCache()

    expect(cache).not.toHaveProperty(projectName)
  })

  it('should return the entire cache', () => {
    const project1 = {
      name: 'project1',
      oid: '123abc',
      schemas: {'schema1.cddl': {cddl: 'Pool = []', rootTypeName: 'Pool'}},
    }
    const project2 = {
      name: 'project2',
      oid: '456def',
      schemas: {'schema2.cddl': {cddl: 'Request = []', rootTypeName: 'Request'}},
    }

    addProjectToCddlSchemasCache(project1.name, project1.oid, project1.schemas)
    addProjectToCddlSchemasCache(project2.name, project2.oid, project2.schemas)

    const cache = getAllCddlSchemasFromCache()

    expect(cache).toEqual({
      [project1.name]: {
        projectGithubOid: project1.oid,
        schemas: project1.schemas,
      },
      [project2.name]: {
        projectGithubOid: project2.oid,
        schemas: project2.schemas,
      },
    })
  })
})
