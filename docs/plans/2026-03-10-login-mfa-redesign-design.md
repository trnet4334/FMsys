# Login + MFA Redesign (Neutral Product UI)

## Summary
Redesign the prototype login and MFA pages to a neutral product UI while preserving the existing page structure and most elements. The goal is a cleaner, more professional visual system with updated typography, spacing, and surfaces, without changing functionality or flow.

## Architecture
- Keep `prototype/login.html` and `prototype/mfa.html` as static HTML using the Tailwind CDN.
- No JS logic changes, no new runtime dependencies.
- Preserve the current layout structure (two-panel login; header + card MFA).

## Components
Login page:
- Left visual/branding panel on desktop.
- Right form panel with social buttons, divider, inputs, remember-me, CTA, and footer links.
- Updated palette and typography for a neutral, modern product look.

MFA page:
- Top header bar.
- Illustration/hero panel.
- MFA card with six single-character inputs, verify button, resend link.
- Trust markers and legal/footer text.

## Data Flow
Unchanged. Inputs and buttons remain static placeholders ready for integration.

## Error Handling
No functional error handling changes. Preserve visual focus/hover/disabled states.

## Testing
Manual visual check on mobile and desktop breakpoints to ensure layout and hierarchy remain intact.
