INSERT INTO projects (id, name, sub, description, type, status, year, mag, seed, ra, dec, stack, live_url, repo_url, updated_at) VALUES
(
  'NGC-2440',
  'Parallax',
  'n-body gravity sim on WebGPU compute shaders',
  'Deterministic 2D gravity simulation with n-body collision resolution. Runs entirely on GPU compute shaders via WebGPU — no JS physics loop.',
  'GAME', 'LIVE', 2025, 4.2, 0.244,
  '07h 41m', '-18°12''',
  '["WebGPU","WGSL","Vite","TypeScript"]',
  'https://parallax.rednebula.dev',
  'https://github.com/rednebula100/parallax',
  '2025-09-14T11:22:00Z'
),
(
  'NGC-3132',
  'Voidmap',
  'Procedural star-chart generator from ICRS coordinates',
  'Procedural star-chart generator seeded by ICRS coordinates. Renders accurate constellation geometry; exports to SVG or print-ready PDF via WASM.',
  'TOOL', 'LIVE', 2024, 5.7, 0.313,
  '10h 07m', '-40°26''',
  '["Rust","WASM","Canvas 2D","SVG"]',
  'https://voidmap.rednebula.dev',
  'https://github.com/rednebula100/voidmap',
  '2025-11-02T08:44:00Z'
),
(
  'NGC-7009',
  'Halcyon',
  'Terminal-style static blog engine — zero JS in production',
  'Minimalist terminal-style blog engine. Markdown source, static output, zero JS shipped to the browser. Sub-10ms build times via Go.',
  'WEB', 'WIP', 2025, 6.3, 0.701,
  '21h 04m', '-11°22''',
  '["Go","Goldmark","HTML","Plain CSS"]',
  NULL,
  'https://github.com/rednebula100/halcyon',
  '2026-01-09T16:11:00Z'
),
(
  'NGC-0650',
  'Eigenform',
  'Fixed-point self-referential type system — no heap allocation',
  'Fixed-point self-referential type system experiment. Encodes recursive algebraic data structures without heap allocation using Zig comptime.',
  'LIB', 'ALPHA', 2025, 7.1, 0.065,
  '01h 42m', '+51°34''',
  '["Zig","LLVM","Comptime"]',
  NULL,
  'https://github.com/rednebula100/eigenform',
  '2025-12-30T20:58:00Z'
),
(
  'NGC-1360',
  'Liminal',
  'Atmospheric horror with BSP room generation and per-room DSP',
  'Atmospheric horror exploration game. Procedural room generation via BSP trees. Per-room audio DSP pipeline; each space has a distinct acoustic signature.',
  'GAME', 'WIP', 2026, 8.0, 0.136,
  '03h 33m', '-25°51''',
  '["C++","SDL3","OpenGL","Odin"]',
  NULL,
  'https://github.com/rednebula100/liminal',
  '2026-04-18T13:03:00Z'
),
(
  'NGC-4361',
  'Spectra',
  'CLI spectrum analyser — FFT bins as scrolling waveform in terminal',
  'CLI spectrum analyser for audio files. Displays FFT magnitude bins as a live-scrolling waveform rendered entirely in the terminal with Rich.',
  'TOOL', 'ARCHIVED', 2023, 9.4, 0.436,
  '12h 24m', '-18°47''',
  '["Python","NumPy","Rich"]',
  NULL,
  'https://github.com/rednebula100/spectra',
  '2024-03-05T09:30:00Z'
);
