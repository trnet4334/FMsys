# Login + MFA Wire-Up (Neutral UI Integration)

## Summary
Wire the updated neutral UI prototype layouts into the Next.js login and MFA routes by translating the prototype markup into JSX while preserving existing authentication behaviors. Apply the neutral palette and Manrope typography globally.

## Architecture
- Update `LoginPanel` and `MfaPanel` to render the prototype layout using Tailwind classes.
- Keep all auth logic and routing behavior intact (OAuth, recovery login, MFA verification, demo code loader).
- Replace global tokens and body styling in `apps/web/src/styles/tokens.css` and `apps/web/app/globals.css` with the neutral palette and font.

## Components
Login:
- Two-column layout on desktop with left visual panel and right form panel.
- Social login buttons, divider, recovery login form, remember-me, CTA, and footer links remain.
- Error and pending states integrated into the new layout.

MFA:
- Header bar with brand and help button.
- Illustration panel, MFA card, and trust markers preserved.
- Six-digit code entry wired to existing state and submit handler.
- Demo code loader and error display retained.

## Data Flow
No change. Existing client-side handlers for OAuth, recovery login, MFA verification, and demo code fetch remain.

## Error Handling
No change. Existing error strings are displayed within the new layout with neutral styling.

## Testing
- Update or add minimal UI structure tests if necessary.
- Run `npm test` to confirm no regressions.
