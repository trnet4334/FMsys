# Login + MFA Copy Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update login and MFA pages to match the prototype’s copy exactly while preserving all auth behaviors and using available Material Symbols icons.

**Architecture:** Keep current JSX structure and handlers, replace labels, helper text, and headings with prototype copy. Update UI marker tests to assert the new copy is present.

**Tech Stack:** Next.js (App Router), React, Tailwind, Node.js `node:test`.

---

### Task 1: Update login copy to match prototype

**Files:**
- Modify: `apps/web/src/components/auth/login-panel.tsx`
- Test: `tests/web-auth-ui.test.js`

**Step 1: Write the failing test**

Update `tests/web-auth-ui.test.js` to assert prototype login copy.

```js
assert.match(source, /Welcome Back/i);
assert.match(source, /Enter your credentials to access your dashboard/i);
assert.match(source, /Start your 14-day free trial/i);
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/web-auth-ui.test.js`
Expected: FAIL.

**Step 3: Write minimal implementation**

Replace the login panel copy in `login-panel.tsx` with the prototype wording:
- Headline/subcopy, CTA labels, and footer links.
- Keep demo credentials note, error text, and handlers intact.
- Ensure icons render with available Material Symbols glyphs.

**Step 4: Run test to verify it passes**

Run: `node --test tests/web-auth-ui.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/components/auth/login-panel.tsx tests/web-auth-ui.test.js
git commit -m "copy: align login panel with prototype"
```

### Task 2: Update MFA copy to match prototype

**Files:**
- Modify: `apps/web/src/components/auth/mfa-panel.tsx`
- Test: `tests/web-auth-ui.test.js`

**Step 1: Write the failing test**

Extend `tests/web-auth-ui.test.js` to assert prototype MFA copy.

```js
assert.match(source, /Verification Required/i);
assert.match(source, /Please enter the 6-digit code from your authenticator app/i);
assert.match(source, /Didn't receive a code\\?/i);
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/web-auth-ui.test.js`
Expected: FAIL.

**Step 3: Write minimal implementation**

Replace MFA panel copy in `mfa-panel.tsx` with prototype wording:
- Illustration text, CTA labels, footer copy, and help text.
- Preserve demo code loader and error display.

**Step 4: Run test to verify it passes**

Run: `node --test tests/web-auth-ui.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/components/auth/mfa-panel.tsx tests/web-auth-ui.test.js
git commit -m "copy: align mfa panel with prototype"
```

### Task 3: Verify full test suite

**Files:**
- Test: `tests/**`

**Step 1: Run tests**

Run: `npm test`
Expected: PASS.

**Step 2: Commit**

```bash
git status -sb
```
