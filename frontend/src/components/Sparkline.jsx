export default function Sparkline({ data }) {
  const W = 64, H = 16, stride = W / data.length, barW = 3
  const max = Math.max(...data)
  return (
    <svg width={W} height={H} style={{ display: 'block', color: 'var(--accent-d)' }}>
      {data.map((v, i) => {
        const h = Math.max(2, Math.round((v / (max || 1)) * H))
        return (
          <rect key={i} x={i * stride} y={H - h} width={barW} height={h}
            fill={v === max ? 'var(--accent)' : 'currentColor'} />
        )
      })}
    </svg>
  )
}
