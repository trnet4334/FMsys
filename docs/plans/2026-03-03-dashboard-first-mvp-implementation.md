# Dashboard-First MVP Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver a modern, desktop-first, mock-driven `/dashboard` frontend in `apps/web` with reusable sections and backend-compatible data adapters.

**Architecture:** Build a Next.js App Router frontend in `apps/web`, driven by typed mock data contracts and adapter functions. Compose the dashboard from focused section components (hero, trend, allocation, alerts, cashflow) with shared visual tokens and restrained motion. Keep API wiring abstracted behind adapter boundaries for later backend integration.

**Tech Stack:** Next.js 15 + React 19 + TypeScript + Tailwind CSS + Recharts

---

### Task 1: Initialize the real web app foundation

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/page.tsx`
- Create: `apps/web/app/dashboard/page.tsx`
- Create: `apps/web/app/globals.css`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/tailwind.config.ts`

**Step 1: Write the failing test**
```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('web app foundation files exist', () => {
  for (const file of [
    'apps/web/app/layout.tsx',
    'apps/web/app/dashboard/page.tsx',
    'apps/web/tailwind.config.ts',
  ]) {
    assert.equal(fs.existsSync(file), true);
  }
});
```

**Step 2: Run test to verify it fails**
Run: `node --test tests/web-foundation.test.js`
Expected: FAIL missing files.

**Step 3: Write minimal implementation**
- Add Next.js scripts/dependencies.
- Add base app router files and global CSS.

**Step 4: Run test to verify it passes**
Run: `node --test tests/web-foundation.test.js`
Expected: PASS.

**Step 5: Commit**
```bash
git add apps/web tests/web-foundation.test.js
git commit -m "feat(web): scaffold nextjs dashboard app foundation"
```

### Task 2: Add theme tokens and modern visual primitives

**Files:**
- Create: `apps/web/src/styles/tokens.css`
- Create: `apps/web/src/components/ui/metric-card.tsx`
- Create: `apps/web/src/components/ui/section-header.tsx`
- Create: `apps/web/src/components/ui/status-badge.tsx`
- Test: `tests/web-theme-primitives.test.js`

**Step 1: Write the failing test**
```js
test('theme tokens and UI primitives exist', () => {
  // assert token file + primitive component files exist
});
```

**Step 2: Run test to verify it fails**
Run: `node --test tests/web-theme-primitives.test.js`
Expected: FAIL missing files.

**Step 3: Write minimal implementation**
- Define color/typography/spacing/motion tokens.
- Implement reusable card/header/badge primitives.

**Step 4: Run test to verify it passes**
Run: `node --test tests/web-theme-primitives.test.js`
Expected: PASS.

**Step 5: Commit**
```bash
git add apps/web/src tests/web-theme-primitives.test.js
git commit -m "feat(web): add dashboard design tokens and primitives"
```

### Task 3: Implement mock data contracts and adapters

**Files:**
- Create: `apps/web/src/lib/mock-data/contracts.ts`
- Create: `apps/web/src/lib/mock-data/seed.ts`
- Create: `apps/web/src/lib/mock-data/adapters.ts`
- Test: `tests/web-mock-adapters.test.js`

**Step 1: Write the failing test**
```js
test('mock adapter maps seed to dashboard contracts', () => {
  // assert required keys for hero/trend/allocation/alerts/cashflow
});
```

**Step 2: Run test to verify it fails**
Run: `node --test tests/web-mock-adapters.test.js`
Expected: FAIL missing adapter/contracts.

**Step 3: Write minimal implementation**
- Add typed contracts and seed data.
- Build adapter that emits normalized dashboard sections.

**Step 4: Run test to verify it passes**
Run: `node --test tests/web-mock-adapters.test.js`
Expected: PASS.

**Step 5: Commit**
```bash
git add apps/web/src/lib tests/web-mock-adapters.test.js
git commit -m "feat(web): add mock data contracts and dashboard adapters"
```

### Task 4: Build dashboard section components

**Files:**
- Create: `apps/web/src/components/dashboard/net-worth-hero.tsx`
- Create: `apps/web/src/components/dashboard/trend-panel.tsx`
- Create: `apps/web/src/components/dashboard/allocation-panel.tsx`
- Create: `apps/web/src/components/dashboard/alerts-panel.tsx`
- Create: `apps/web/src/components/dashboard/cashflow-mini-panel.tsx`
- Test: `tests/web-dashboard-sections.test.js`

**Step 1: Write the failing test**
```js
test('dashboard section component files exist', () => {
  // assert section files exist
});
```

**Step 2: Run test to verify it fails**
Run: `node --test tests/web-dashboard-sections.test.js`
Expected: FAIL missing files.

**Step 3: Write minimal implementation**
- Implement each section using primitives and tokenized styles.
- Use subtle motion classes and desktop-first layout assumptions.

**Step 4: Run test to verify it passes**
Run: `node --test tests/web-dashboard-sections.test.js`
Expected: PASS.

**Step 5: Commit**
```bash
git add apps/web/src/components tests/web-dashboard-sections.test.js
git commit -m "feat(web): implement dashboard section components"
```

### Task 5: Compose `/dashboard` and wire local demo run

**Files:**
- Modify: `apps/web/app/dashboard/page.tsx`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/package.json`
- Create: `tests/web-dashboard-page.test.js`

**Step 1: Write the failing test**
```js
test('dashboard page references all core sections', () => {
  // assert page source includes hero/trend/allocation/alerts/cashflow imports
});
```

**Step 2: Run test to verify it fails**
Run: `node --test tests/web-dashboard-page.test.js`
Expected: FAIL before composition.

**Step 3: Write minimal implementation**
- Compose final dashboard page using adapter output.
- Add responsive grid + atmosphere background.
- Add `dev` script for `apps/web` and verify build/dev command wiring.

**Step 4: Run test to verify it passes**
Run: `node --test tests/web-dashboard-page.test.js`
Expected: PASS.

**Step 5: Run full verification**
Run: `npm test`
Expected: All tests PASS.

**Step 6: Commit**
```bash
git add apps/web tests/web-dashboard-page.test.js
git commit -m "feat(web): compose modern dashboard-first mvp page"
```
