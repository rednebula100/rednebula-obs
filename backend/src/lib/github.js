const CACHE_TTL = 3600

export async function getRepoData(kv, repoPath, token) {
  const cacheKey = `github:cache:${repoPath}`
  const cached = await kv.get(cacheKey, 'json')
  if (cached) return cached

  const headers = { 'User-Agent': 'rednebula-obs' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`https://api.github.com/repos/${repoPath}`, { headers })
  if (!res.ok) return null

  const d = await res.json()
  const shaped = {
    stars:     d.stargazers_count,
    forks:     d.forks_count,
    createdAt: d.created_at,
    updatedAt: d.pushed_at,
    language:  d.language,
  }

  await kv.put(cacheKey, JSON.stringify(shaped), { expirationTtl: CACHE_TTL })
  return shaped
}

/** Extract "owner/repo" from a GitHub URL, or null. */
export function parseRepoPath(url) {
  if (!url) return null
  const m = url.match(/github\.com\/([^/]+\/[^/?#]+)/)
  return m ? m[1].replace(/\.git$/, '') : null
}
