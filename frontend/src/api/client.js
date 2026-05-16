const BASE = import.meta.env.VITE_API_URL

async function request(path, options = {}) {
  const res  = await fetch(`${BASE}${path}`, options)
  const json = await res.json()
  if (!json.success) throw new Error(json.error ?? `API error ${res.status}`)
  return json.data
}

export const api = {
  getProjects:  ()   => request('/projects'),
  recordView:   (id) => request(`/views/${id}`, { method: 'POST' }),
  getAnalytics: (id) => request(`/analytics/${id}`),
}
