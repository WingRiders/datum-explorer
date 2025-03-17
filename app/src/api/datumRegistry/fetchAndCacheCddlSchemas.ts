import {groupBy} from 'lodash'
import {
  fetchProjectsFromDatumRegistry,
  fetchSchemasForProjectsFromDatumRegistry,
} from './cardanoDatumRegistry'
import {
  addProjectToCddlSchemasCache,
  deleteProjectFromCddlSchemasCache,
  getAllCddlSchemasFromCache,
} from './cddlSchemasCache'

/**
 * Synchronizes the cache of CDDL schemas with the Datum Registry.
 *
 * Function fetches only schemas for new or updated projects
 * and doesn't fetch schemas for projects that wasn't changed since last call of this function.
 *
 * Synchronization mechanism is based on using OIDs of the projects:
 *   if a file in a project has been changed, added or deleted, the OID of the project changes,
 *   as well as if the project folder has been renamed
 *
 * If fetching from Datum Registry fails, the function throws an error and the cache remains unchanged.
 */
export const fetchAndCacheCddlSchemas = async () => {
  const projectFolders = await fetchProjectsFromDatumRegistry()
  const fetchedProjectsOids = new Set(projectFolders.map(({oid}) => oid))

  const cddlSchemasCache = getAllCddlSchemasFromCache()
  const cachedProjects = Object.entries(cddlSchemasCache).map(
    ([projectName, {projectGithubOid: oid}]) => ({projectName, oid}),
  )
  const cachedProjectsOids = new Set(cachedProjects.map(({oid}) => oid))

  // we fetch schemas only for projects whose oids are not in the cache
  const projectsFoldersToFetch = projectFolders.filter(({oid}) => !cachedProjectsOids.has(oid))
  const newCddlSchemas = await fetchSchemasForProjectsFromDatumRegistry(projectsFoldersToFetch)

  // we remove all projects whose oids is no longer in the datum registry
  // cached projects will be removed if they were deleted from registry or their oids has been changed,
  // e.g. because of adding/removing/updating schema files or renaming the project folder
  const projectsToRemove = cachedProjects.filter(({oid}) => !fetchedProjectsOids.has(oid))
  projectsToRemove.forEach(({projectName}) => deleteProjectFromCddlSchemasCache(projectName))

  // saving new schemas to the cache
  const newCddlSchemasGroupedByProjectName = groupBy(newCddlSchemas, 'projectName')
  Object.entries(newCddlSchemasGroupedByProjectName).forEach(([projectName, schemas]) => {
    // projectGithubOid is equal for all schemas with the same projectName, so we can take the first one
    // schemas[0] is defined: schemas size at least 1 because of the groupBy
    const projectGithubOid = schemas[0]!.projectGithubOid
    addProjectToCddlSchemasCache(
      projectName,
      projectGithubOid,
      Object.fromEntries(schemas.map(({fileName, cddl}) => [fileName, {cddl}])),
    )
  })
}
