# Login + MFA Wire-Up Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Next.js login and MFA panels with JSX translations of the neutral UI prototypes, while preserving all auth behaviors and updating the global theme to the neutral palette and Manrope font.

**Architecture:** Update the two auth components to render Tailwind class markup equivalent to `prototype/login.html` and `prototype/mfa.html`, wiring existing handlers and state into the new structure. Replace global tokens and body styling to the neutral palette.

**Tech Stack:** Next.js (App Router), React, Tailwind, CSS custom properties.

---

### Task 1: Update global tokens and typography

**Files:**
- Modify: `apps/web/src/styles/tokens.css`
- Modify: `apps/web/app/globals.css`

**Step 1: Write the failing test**

Add an assertion to `tests/web-app-shell.test.js` to check that the global font stack includes Manrope.

```js
import fs from 'node:fs';
import path from 'node:path';

const globals = fs.readFileSync(path.resolve(process.cwd(), 'apps/web/app/globals.css'), 'utf8');
assert.match(globals, /Manrope/i);
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/web-app-shell.test.js`
Expected: FAIL (Manrope not found).

**Step 3: Write minimal implementation**

Update tokens and globals:
- Replace palette in `tokens.css` with neutral palette values that align with the prototype.
- Update `globals.css` to use Manrope and a neutral background (no radial gradient).
- Keep existing CSS variable names used by the app (`--bg-*`, `--ink-*`, `--line`, `--brand`).

**Step 4: Run test to verify it passes**

Run: `node --test tests/web-app-shell.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/styles/tokens.css apps/web/app/globals.css tests/web-app-shell.test.js
git commit -m "style: apply neutral palette and manrope globally"
```

### Task 2: Wire the login panel to the prototype layout

**Files:**
- Modify: `apps/web/src/components/auth/login-panel.tsx`
- Test: `tests/web-prototype-auth-pages.test.js`

**Step 1: Write the failing test**

Add a check for a neutral UI marker in the login panel output snapshot test (or add a new test if needed).

```js
import { renderToStaticMarkup } from 'react-dom/server';
import { LoginPanel } from '../apps/web/src/components/auth/login-panel';

const html = renderToStaticMarkup(<LoginPanel />);
assert.match(html, /data-theme="neutral"/i);
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/web-app-shell.test.js`
Expected: FAIL.

**Step 3: Write minimal implementation**

Translate `prototype/login.html` into JSX inside `LoginPanel`:
- Keep handlers `handleOAuth`, `handleRecoverySubmit`, and state `pending`/`error`.
- Wire buttons and form inputs to existing handlers.
- Preserve recovery login details section and demo credentials text.
- Use Tailwind class names from the prototype.

**Step 4: Run test to verify it passes**

Run: `node --test tests/web-app-shell.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/components/auth/login-panel.tsx tests/web-app-shell.test.js
git commit -m "style: wire login panel to prototype layout"
```

### Task 3: Wire the MFA panel to the prototype layout

**Files:**
- Modify: `apps/web/src/components/auth/mfa-panel.tsx`
- Test: `tests/web-app-shell.test.js`

**Step 1: Write the failing test**

Add a check for a neutral UI marker in the MFA panel output.

```js
import { renderToStaticMarkup } from 'react-dom/server';
import { MfaPanel } from '../apps/web/src/components/auth/mfa-panel';

const html = renderToStaticMarkup(<MfaPanel />);
assert.match(html, /data-theme="neutral"/i);
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/web-app-shell.test.js`
Expected: FAIL.

**Step 3: Write minimal implementation**

Translate `prototype/mfa.html` into JSX inside `MfaPanel`:
- Keep state for `code`, `pending`, `error`, `demoCode`.
- Wire input group to `code` updates and submission.
- Keep demo code loader and error display.
- Use Tailwind class names from the prototype.

**Step 4: Run test to verify it passes**

Run: `node --test tests/web-app-shell.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/components/auth/mfa-panel.tsx tests/web-app-shell.test.js
git commit -m "style: wire mfa panel to prototype layout"
```

### Task 4: Verify full test suite

**Files:**
- Test: `tests/**`

**Step 1: Run tests**

Run: `npm test`
Expected: PASS.

**Step 2: Commit**

```bash
git status -sb
```
