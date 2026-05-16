import { PROJECTS_MOCK } from './mock.js'
import { api } from '../api/client.js'

// Synchronous initial value — replaced after fetchProjects() resolves.
export let PROJECTS = PROJECTS_MOCK

export async function fetchProjects() {
  const data = await api.getProjects()
  PROJECTS = data
  return data
}

export async function recordView(id) {
  return api.recordView(id)
}

export async function fetchAnalytics(id) {
  return api.getAnalytics(id)
}
