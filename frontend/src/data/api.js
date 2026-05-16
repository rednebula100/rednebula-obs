import { api } from '../api/client.js'

export let PROJECTS = []

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
