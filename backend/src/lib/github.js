const REPO_CACHE_TTL = 3600
const REPO_DETAIL_TTL = 3600

export async function getPublicRepos(kv, username, token) {
  const cacheKey = `github:repos:${username}`
  const cached = await kv.get(cacheKey, 'json')
  if (cached) return cached

  const headers = { 'User-Agent': 'rednebula-obs' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&type=owner`,
    { headers }
  )
  if (!res.ok) return []

  const repos = await res.json()
  const owned = repos.filter(r => !r.fork && !r.private)
  try { await kv.put(cacheKey, JSON.stringify(owned), { expirationTtl: REPO_CACHE_TTL }) } catch {}
  return owned
}

export async function getRepoData(kv, repoPath, token) {
  const cacheKey = `github:cache:${repoPath}`
  const cached = await kv.get(cacheKey, 'json')
  if (cached) return cached

  const headers = { 'User-Agent': 'rednebula-obs' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`https://api.github.com/repos/${repoPath}`, { headers })
  if (!res.ok) return null

  const d = await res.json()
  const shaped = { stars: d.stargazers_count, forks: d.forks_count, language: d.language, updatedAt: d.pushed_at }
  await kv.put(cacheKey, JSON.stringify(shaped), { expirationTtl: REPO_DETAIL_TTL })
  return shaped
}

export function parseRepoPath(url) {
  if (!url) return null
  const m = url.match(/github\.com\/([^/]+\/[^/?#]+)/)
  return m ? m[1].replace(/\.git$/, '') : null
}

// Stable 4-digit NGC ID derived from repo name
export function stableNgcId(repoName) {
  let h = 0
  for (let i = 0; i < repoName.length; i++) {
    h = (Math.imul(31, h) + repoName.charCodeAt(i)) | 0
  }
  return 'NGC-' + String((Math.abs(h) % 9000) + 1000)
}

// Stable 0..1 seed derived from repo name
export function stableSeed(repoName) {
  let h = 0
  for (let i = 0; i < repoName.length; i++) {
    h = (Math.imul(17, h) + repoName.charCodeAt(i)) | 0
  }
  return (Math.abs(h) % 1000) / 1000
}

export function seedToRa(s) {
  const h = Math.floor(s * 24)
  const m = Math.floor((s * 24 - h) * 60)
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
}

export function seedToDec(s) {
  const abs = Math.floor(s * 89)
  const min = Math.floor((s * 89 - Math.floor(s * 89)) * 60)
  const sign = s > 0.5 ? '+' : '-'
  return `${sign}${abs}°${String(min).padStart(2, '0')}′`
}
