## ADDED Requirements

### Requirement: Dashboard routes require authenticated session
The system MUST block unauthenticated users from all dashboard routes and SHALL redirect them to the login page.

#### Scenario: Unauthenticated user requests dashboard route
- **WHEN** a user without a valid session opens a protected dashboard URL
- **THEN** the system redirects the user to `/login` and preserves the intended destination for post-login return

### Requirement: Authenticated users can access dashboard directly
The system SHALL allow users with a valid, active session to access dashboard routes without additional login prompts.

#### Scenario: Valid session exists
- **WHEN** a user with a valid authenticated session opens `/dashboard`
- **THEN** the system renders dashboard content without redirecting to login

### Requirement: Login page respects existing authenticated state
The system MUST detect existing active sessions on login entry and SHALL route authenticated users to their dashboard landing page.

#### Scenario: Authenticated user opens login page
- **WHEN** a user with a valid session opens `/login`
- **THEN** the system redirects the user to `/dashboard`
