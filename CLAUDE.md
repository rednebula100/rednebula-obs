# CLAUDE.md
Behavioral guidelines for web project development. Merge with project-specific instructions below the divider.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

For UI/UX decisions, always clarify:
- Target devices (mobile / desktop / both)
- Whether design system / component library is already in use
- Whether there are existing style conventions to match

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

For frontend specifically:
- Don't add animations unless asked.
- Don't introduce a new dependency if native CSS / JS covers it.
- Don't create a component abstraction for something used once.

Ask yourself: *"Would a senior engineer say this is overcomplicated?"* If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style (quote style, indentation, naming conventions), even if you'd do it differently.
- If you notice unrelated dead code, **mention it — don't delete it**.

When your changes create orphans:
- Remove imports / variables / functions that **your changes** made unused.
- Don't remove pre-existing dead code unless asked.

For CSS: don't touch unrelated selectors or reformat existing rules.  
For HTML: don't restructure markup outside the scope of the change.

The test: **Every changed line should trace directly to the user's request.**

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

For UI tasks, state what "done" looks like before starting:
- "Button shows loading state and disables on submit" — not "make the button work"
- "Error message appears under the input on blur" — not "add error handling"

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## Web-Specific Conventions

### File & Folder Structure
- Follow whatever structure already exists. Don't reorganize unprompted.
- If starting fresh, use the simplest flat structure that works. Add folders only when there's a reason.

### Naming
- Match the casing convention already in the project (camelCase, kebab-case, etc.).
- Component files: PascalCase. Utility files: camelCase. CSS files: match the component they style.

### CSS
- Use existing CSS custom properties / design tokens if they exist. Don't invent new ones unless asked.
- Don't add vendor prefixes unless there's a known compatibility reason.
- Don't convert between CSS methodologies (e.g., BEM ↔ utility classes) without being asked.

### JavaScript / TypeScript
- Don't add TypeScript types to a JS file unless converting to TS was requested.
- Don't swap between `function` declarations and arrow functions to "normalize" the codebase.
- Keep `console.log` removal to lines you personally added.

### Dependencies
- Don't `npm install` anything without explicit approval or instruction.
- If a dependency would help, suggest it with a reason — let the user decide.

### APIs & Data
- Never hardcode secrets, API keys, or credentials. Use env vars.
- If you need to mock data, make it clearly labeled as mock. Don't mix it into production paths.

---

## Project-Specific Instructions

**Stack:**
- Frontend: Vite + React 18, plain CSS, WebGL (no Three.js)
- Backend: Cloudflare Workers + Hono, KV, D1
- State: React local state only (no Zustand/Context)
- Testing: none currently

**Constraints:**
- No new npm packages without approval
- Frontend data layer: all imports go through `frontend/src/data/api.js`
- `frontend/src/styles/tokens.css` — design tokens, do not modify without asking
- Backend: all responses must be `{ success, data, error }` shape
- No hardcoded secrets — use Cloudflare Workers env vars

**Key files:**
- `frontend/src/data/api.js` — single import point; swap mock → real API here when ready
- `frontend/src/styles/tokens.css` — design tokens
- `frontend/src/components/Scope.jsx` — WebGL shader is verbatim from spec, do not rewrite
- `backend/src/index.js` — Hono app entry, route mounting
- `backend/wrangler.toml` — KV/D1 bindings and Worker config
- `backend/src/db/schema.sql` — D1 schema source of truth

---

## Cloudflare / Tooling

### wrangler
- **Already logged in** on this machine — never run `wrangler login` again unless the user explicitly asks.
- **Wrangler cannot be run from a Claude subprocess.** OAuth credentials are only available in the user's own terminal session. When any wrangler command is needed (create resources, deploy, secret put), give the user the exact command(s) to run and ask them to paste the output back.
- **Secrets** (`wrangler secret put KEY`) prompt for the value interactively. Tell the user to run it in their terminal. If the value is known, they can pipe it: `echo "value" | wrangler secret put KEY`.

### npm
- This machine has an SSL cert verification issue. Always pass `--strict-ssl false` to npm install:
  ```
  npm install --strict-ssl false
  ```

---

## These guidelines are working if:
- Diffs have fewer unnecessary changes
- Clarifying questions come **before** implementation, not after mistakes
- Rewrites due to overcomplication are rare
- "I assumed X — is that right?" appears more than "I went ahead and..."
