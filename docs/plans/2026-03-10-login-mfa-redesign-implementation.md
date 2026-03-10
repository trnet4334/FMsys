# Login + MFA Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restyle the prototype login and MFA pages to a neutral product UI while preserving the existing layout and core elements.

**Architecture:** Keep the two static HTML files in `prototype/` and update Tailwind classes, typography, spacing, and surface treatments without changing flow or adding new JS. Add a small Node test to ensure key elements still exist.

**Tech Stack:** HTML, Tailwind CDN, Node.js `node:test`.

---

### Task 1: Add basic prototype page structure tests

**Files:**
- Create: `tests/web-prototype-auth-pages.test.js`

**Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (file) =>
  fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');

test('login prototype keeps core elements', () => {
  const html = read('prototype/login.html');
  assert.match(html, /<form[^>]*>/i);
  assert.match(html, /name="email"/i);
  assert.match(html, /name="password"/i);
  assert.match(html, /Remember me/i);
  assert.match(html, /Sign In/i);
});

test('mfa prototype keeps core elements', () => {
  const html = read('prototype/mfa.html');
  assert.match(html, /Enter MFA Code/i);
  assert.match(html, /one-time-code/i);
  assert.match(html, /Verify/i);
  assert.match(html, /Resend code/i);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/web-prototype-auth-pages.test.js`
Expected: FAIL with "ENOENT: no such file or directory" or missing matches.

**Step 3: Write minimal implementation**

Create `tests/web-prototype-auth-pages.test.js` with the code above.

**Step 4: Run test to verify it passes**

Run: `node --test tests/web-prototype-auth-pages.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/web-prototype-auth-pages.test.js
git commit -m "test: cover prototype login and mfa pages"
```

### Task 2: Restyle the login prototype page

**Files:**
- Modify: `prototype/login.html`
- Test: `tests/web-prototype-auth-pages.test.js`

**Step 1: Write the failing test**

Add assertions for the new neutral UI tokens to `tests/web-prototype-auth-pages.test.js`:

```js
assert.match(html, /Neutral UI/i);
assert.match(html, /data-theme="neutral"/i);
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/web-prototype-auth-pages.test.js`
Expected: FAIL for missing neutral UI markers.

**Step 3: Write minimal implementation**

Update `prototype/login.html`:
- Replace the color system with neutral grays and a single accent color.
- Tighten typographic hierarchy (headline, section titles, helper text).
- Normalize spacing, border radius, and shadows for product UI tone.
- Keep the two-panel layout and all major elements.

**Step 4: Run test to verify it passes**

Run: `node --test tests/web-prototype-auth-pages.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add prototype/login.html tests/web-prototype-auth-pages.test.js
git commit -m "style: refresh login prototype to neutral ui"
```

### Task 3: Restyle the MFA prototype page

**Files:**
- Modify: `prototype/mfa.html`
- Test: `tests/web-prototype-auth-pages.test.js`

**Step 1: Write the failing test**

Add assertions for the new neutral UI tokens to `tests/web-prototype-auth-pages.test.js`:

```js
assert.match(html, /data-theme="neutral"/i);
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/web-prototype-auth-pages.test.js`
Expected: FAIL for missing neutral UI markers.

**Step 3: Write minimal implementation**

Update `prototype/mfa.html`:
- Align surfaces, borders, and typography with the login page.
- Keep header, illustration, MFA card, resend, trust markers, and footer.
- Ensure 6-digit inputs remain clearly separated and accessible.

**Step 4: Run test to verify it passes**

Run: `node --test tests/web-prototype-auth-pages.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add prototype/mfa.html tests/web-prototype-auth-pages.test.js
git commit -m "style: refresh mfa prototype to neutral ui"
```

### Task 4: Verify full test suite

**Files:**
- Test: `tests/**`

**Step 1: Run tests**

Run: `npm test`
Expected: PASS (all suites).

**Step 2: Commit**

```bash
git status -sb
```
