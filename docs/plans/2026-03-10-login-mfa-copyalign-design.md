# Login + MFA Copy Alignment Design

## Summary
Align the Next.js login and MFA pages to match the prototype text and tone exactly, while preserving all existing authentication behaviors and layout structure. Replace icons with available Material Symbols equivalents.

## Architecture
- Update `LoginPanel` and `MfaPanel` JSX to use the prototype copy verbatim.
- Keep all event handlers and auth flows unchanged.
- Replace any missing icons with closest Material Symbols alternatives.

## Components
Login:
- Left panel headline, subcopy, and metrics match prototype.
- Right panel headings, helper text, CTA labels, and legal links match prototype.
- Demo credentials and error messaging remain but are visually integrated.

MFA:
- Header title and help button retained with prototype labels.
- Illustration title, helper text, CTA labels, and footer copy match prototype.
- Demo code loader and error states preserved.

## Data Flow
No changes to OAuth, recovery login, MFA verification, or demo code retrieval.

## Error Handling
Existing error strings are shown in the redesigned locations without changing content.

## Testing
Update existing UI marker tests to assert key prototype copy strings are present.
