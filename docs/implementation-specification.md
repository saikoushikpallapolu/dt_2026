# Where Is My Professor?

**Final Implementation Specification — Agent Execution Instructions**

| Field | Value |
| --- | --- |
| Project | Where Is My Professor? |
| Theme | Smart & Organized Campus Life |
| Problem | Campus Hunt Challenge |
| Version | 1.0 |
| Goal | Build a deployable, mobile-first faculty availability and office-status platform. |

---

## 1. Product mission

Build a web application that helps college students determine the latest published availability and optional location of professors without wasting time searching across campus.

The central workflow is:

**Professor updates status → System stores latest status → Student scans permanent office QR code → Student sees professor's published availability and relevant details.**

A student must also be able to find professors through a searchable directory before reaching the office.

The product must distinguish a professor's self-reported status from independently verified physical location. **Do not claim that automatic location tracking exists.**

---

## 2. User roles

### Student

- Can access public faculty profiles and QR-linked status pages without mandatory login.
- Can search and filter professors.
- Can see approved office information, current recorded status, last update, and optional expected return time.
- Can create an account for meeting requests, favorites, and notifications.
- Can view or cancel their own eligible meeting requests.
- Cannot modify faculty statuses or view private appointments.

### Professor

- Can log in securely.
- Can modify their own status.
- Can add optional return times, public location notes, and messages.
- Can view and manage permitted profile fields and office hours.
- Can accept, reject, or reschedule meeting requests addressed to them.
- Can view their own status history.
- Cannot modify another professor's status.

### Administrator

- Can manage departments, buildings, offices, and faculty assignments.
- Can create and deactivate faculty accounts.
- Can generate, download, revoke, and reassign QR identifiers.
- Can review audit logs and aggregate analytics.
- Can manage configuration and institution-wide status options.
- Must have explicitly authorized access to data, with sensitive actions logged.

---

## 3. Feature requirements

### 3.1 Authentication and authorization

Implement secure professor and administrator authentication with HTTP-only cookies, session handling, password hashing, protected API routes, and role-based authorization.

Student authentication is required for personal features but not for QR scanning or public faculty browsing.

Passwords must never be stored in plaintext. Do not use `localStorage` to store authentication secrets.

### 3.2 Faculty profiles

Each professor profile must support:

- Unique identifier and public slug.
- Name, designation, department, and optional photo.
- Assigned office, building, floor, and room.
- Optional public contact and consultation details.
- Current published status.
- Last-updated timestamp.
- Office hours.
- Profile visibility state.

Administrators can assign offices and manage institutional fields. Professors can edit only permitted personal fields.

### 3.3 Permanent QR codes

Generate a unique public QR reference for each professor.

The QR must resolve to a stable student-facing page using a deployed absolute HTTPS URL.

QR codes must not embed secrets or credentials.

Support downloading QR codes in a print-friendly format and displaying professor name, department, and office reference on the printable sign.

Deactivated or revoked QR references must show a friendly unavailable page.

A professor updating a status must not require QR regeneration.

### 3.4 Faculty status updates

Supported statuses:

- `AVAILABLE`
- `IN_CLASS`
- `IN_MEETING`
- `AWAY`
- `ON_LEAVE`
- `UNKNOWN`

Optional attributes:

- Expected return time.
- Published alternate location.
- Public message.
- Effective duration or expiry.

The backend must validate input, save status, generate a server-controlled timestamp, and record history in a transaction.

Default the status to `UNKNOWN` until the professor provides a valid update.

Store status separately from location information.

Use a configured expiry mechanism. Expired information must not be shown as confidently current.

### 3.5 Student public status page

Prioritize mobile layout and accessibility.

Display:

- Professor identity.
- Department and office information.
- Current effective status.
- Last-updated time.
- Optional expected return.
- Optional approved alternate location.
- Public consultation hours.
- Status freshness.
- Appropriate next actions.

Provide loading, empty, network-error, expired-status, and revoked-QR states.

Do not require login to view a publicly accessible QR status page.

### 3.6 Faculty directory

Support search by name and department.

Support filters for department and public availability.

Display faculty cards with concise office and status information.

Provide pagination or bounded results for scalability.

All directory information must respect visibility controls.

### 3.7 Consultation scheduling

Authenticated students can request a meeting by providing a professor, reason, proposed start and end, and optional note.

Professors can accept, decline, or propose a reschedule.

The system must enforce permissions, avoid conflicting accepted bookings, and preserve a request state history.

Use statuses:

- `PENDING`
- `ACCEPTED`
- `DECLINED`
- `RESCHEDULE_PROPOSED`
- `CANCELLED`
- `COMPLETED`

Meeting information must not be included in public professor status responses.

### 3.8 Optional notifications

Implement in-app notifications for:

- Meeting request creation.
- Meeting acceptance or rejection.
- Rescheduling proposals.
- Other configured status-change events.

Status subscriptions or email notifications are optional improvements, implemented only after the core workflow is stable.

### 3.9 Administrator tools

Provide screens to:

- Create and edit departments.
- Create and edit buildings/offices.
- Onboard professors.
- Assign and update faculty offices.
- Generate or revoke QR associations.
- Review aggregate usage statistics.
- Inspect authorized audit history.

Do not expose unrestricted sensitive user activity to administrators merely for analytics.

---

## 4. Technical stack

Use:

- React + TypeScript + Vite.
- Tailwind CSS and shadcn/ui.
- TanStack Query for API data state.
- Node.js + Express + TypeScript.
- PostgreSQL.
- Prisma ORM.
- Zod for validation.
- Secure cookie-based sessions.
- `qrcode` package for QR generation.
- Vitest, Supertest, and Playwright for automated testing.

Use environment variables for configuration.

Do not introduce unnecessary infrastructure such as Kubernetes, microservices, or AI components.

---

## 5. Architecture

Structure the application as a monorepo:

```text
/frontend
/backend
/shared
/docs
```

### Frontend

- Public pages.
- Student pages.
- Professor dashboard.
- Administrator dashboard.
- Reusable components.
- API client and hooks.

### Backend

- Routes.
- Controllers.
- Services.
- Repositories/database access.
- Authentication and authorization.
- Request validation.
- Central error handling.
- Logging.

### Shared

- DTO schemas.
- Role/status enumerations.
- API response contracts where appropriate.

Maintain separation between controllers, business logic, and persistence.

---

## 6. Database

Use the following main entities:

`users`, `departments`, `buildings`, `offices`, `professors`, `professor_statuses`, `status_history`, `qr_codes`, `office_hours`, `meeting_requests`, `favorites`, `notifications`, `audit_logs`.

Apply proper primary keys, foreign keys, unique constraints, indexes, and migrations.

Ensure one authoritative current status record per professor.

Every status update must atomically update the current status and append a history record.

Store timestamps in UTC.

Avoid storing sensitive scan histories without a defined, justified product requirement.

---

## 7. API

Use a versioned REST API under `/api/v1`.

### Public

- `GET /faculty`
- `GET /faculty/:slug`
- `GET /faculty/:slug/status`
- `GET /qr/:token`
- `GET /departments`
- `GET /faculty/:slug/office-hours`

### Authenticated faculty

- `GET /me`
- `GET /faculty/me/status`
- `PUT /faculty/me/status`
- `PATCH /faculty/me/profile`
- `GET /faculty/me/requests`
- `PATCH /faculty/me/requests/:id`

### Authenticated student

- `POST /meetings`
- `GET /meetings/mine`
- `POST /favorites/:professorId`
- `DELETE /favorites/:professorId`
- `GET /notifications`

### Administrator

- `POST /admin/professors`
- `PATCH /admin/professors/:id`
- `POST /admin/offices`
- `POST /admin/professors/:id/qr`
- `POST /admin/qr/:id/revoke`
- `GET /admin/analytics`
- `GET /admin/audit-logs`

Add necessary authentication/session, configuration, and update endpoints.

Document each endpoint's request, response, authorization, validation, and errors.

---

## 8. UI and UX requirements

Design for mobile first, because QR scanning primarily happens on phones.

Keep the public status page fast, uncluttered, and readable.

The status label and freshness information must be obvious.

Use semantic HTML, keyboard accessibility, sufficient contrast, and responsive layout.

For professor updates, prioritize minimal steps. A common status change should take only one or two meaningful interactions.

Use consistent loading, success, error, and empty states.

Do not fabricate data or show placeholder statuses as genuine live data.

---

## 9. Security requirements

- Enforce authorization server-side.
- Protect sessions and cookies.
- Validate and sanitize user input.
- Prevent cross-site scripting and CSRF.
- Apply rate limiting appropriately.
- Protect public and private fields separately.
- Restrict status updates to authorized professors and administrators.
- Prevent students from accessing other students' meetings.
- Avoid exposing unnecessary faculty movement or sensitive locations.
- Ensure QR links contain no credentials.
- Maintain meaningful audit records.
- Configure HTTPS in deployment.
- Keep secrets outside version control.

---

## 10. Build sequence

### Phase 1: Foundation

Create project setup, tooling, environment configuration, database schema, migrations, and seed data.

### Phase 2: Authentication

Implement secure login, sessions, roles, and protected routes.

### Phase 3: Core MVP

Implement QR generation, faculty status updates, effective status expiry logic, and public status pages.

### Phase 4: Discovery

Implement faculty directory, department filters, office metadata, and administration screens.

### Phase 5: Student Features

Implement student accounts, favorites, office hours, and consultation requests.

### Phase 6: Notifications and Analytics

Implement in-app events, status history, and aggregate administrator metrics.

### Phase 7: Quality and Deployment

Implement automated tests, accessibility fixes, security checks, deployment configuration, monitoring, and documentation.

**Do not implement later-phase features before the core QR-to-status workflow is verified.**

---

## 11. Required automated tests

Include tests for:

- Successful and failed login.
- Role restrictions.
- Professor editing only their own status.
- Student public QR access.
- Unknown, expired, and unavailable status states.
- QR revocation.
- Status updates and history persistence.
- Concurrent status updates.
- Faculty search and filtering.
- Meeting authorization and booking conflicts.
- Admin onboarding.
- Invalid input and API errors.
- Mobile-responsive QR landing page.
- Deployment base URL correctness.

Use unit tests for pure status logic, integration tests for API/database behavior, and Playwright tests for primary user journeys.

---

## 12. Mandatory end-to-end demonstration

Provide seeded demonstration accounts and faculty data for a local/development environment.

Demonstrate this sequence:

1. Administrator creates a professor profile.
2. Administrator assigns an office.
3. Administrator generates a permanent QR code.
4. Professor logs in.
5. Professor sets status to `IN_CLASS` with an expected return time.
6. Student scans the QR code and sees the published status.
7. Professor changes status to `AVAILABLE`.
8. Student refreshes or revisits the page and sees the change.
9. An expired status is handled correctly.
10. Student locates the professor through directory search.
11. Student submits a consultation request.
12. Professor accepts or declines the request.
13. Student sees the final request state.

The application is not considered complete if this end-to-end flow does not work.

---

## 13. Deliverables

Deliver:

- Complete frontend and backend source code.
- Database schema and migration files.
- Seed data.
- Environment-variable template.
- REST API documentation.
- Architecture documentation.
- Setup and deployment instructions.
- Test suite with execution instructions.
- Printed QR-code template.
- Demonstration flow and sample accounts.
- List of known limitations and unimplemented optional features.

---

## 14. Agent execution rules

### Before implementation

1. Review the project specification.
2. Inspect the repository and identify existing code.
3. Create a concise implementation checklist and dependency order.
4. Record any assumptions that affect important technical decisions.
5. Do not invent institutional credentials, production URLs, or live faculty information.

### During implementation

1. Work phase by phase.
2. Implement database migrations before dependent backend logic.
3. Establish API contracts before building tightly coupled frontend flows.
4. Use reusable components and maintainable services.
5. Run relevant tests after every phase.
6. Fix functional and security failures before expanding features.
7. Avoid unnecessary dependencies and premature abstraction.
8. Maintain consistent naming, types, and API structures.
9. Make each phase independently verifiable.
10. Preserve completed functionality when adding new modules.

### After implementation

1. Run the complete test suite.
2. Verify database migrations on a clean environment.
3. Verify permissions and QR-link behavior.
4. Verify mobile responsiveness.
5. Verify the mandatory demonstration flow.
6. Update documentation.
7. Report completed features, test outcomes, remaining limitations, and deployment requirements.

**Primary acceptance criterion:** A real student should be able to scan a professor's office QR code, immediately see the professor's latest trustworthy published availability information, and decide what to do next without requiring unnecessary steps.

Build the core product first, then complete the supporting features in dependency order.

---

## 15. Implementation checklist (dependency order)

Use this order when implementation begins. Later phases must not start until the core QR-to-status workflow in Phase 3 is verified.

### Phase 1 — Foundation

- [ ] Monorepo layout: `/frontend`, `/backend`, `/shared`, `/docs`
- [ ] Tooling: TypeScript, Vite, Express, Prisma, Tailwind, Vitest, Playwright
- [ ] Environment-variable templates (no secrets committed)
- [ ] PostgreSQL schema and Prisma migrations for core entities
- [ ] Seed data for local/demo accounts (fictional, not live faculty)

### Phase 2 — Authentication

- [ ] Password hashing and HTTP-only cookie sessions
- [ ] Role-based authorization (student, professor, administrator)
- [ ] Protected API routes and CSRF protections
- [ ] Public access preserved for QR and directory browsing

### Phase 3 — Core MVP (must verify before later features)

- [ ] Permanent public QR tokens (no credentials in QR)
- [ ] Professor status update + atomic history
- [ ] Server-controlled timestamps and expiry/freshness logic
- [ ] Public mobile-first status page (including revoked/expired/unknown states)
- [ ] Printable QR sign download

### Phase 4 — Discovery

- [ ] Faculty directory search and filters
- [ ] Department, building, and office administration
- [ ] Faculty onboarding, office assignment, QR generate/revoke

### Phase 5 — Student features

- [ ] Student accounts
- [ ] Favorites
- [ ] Office hours
- [ ] Consultation requests and conflict handling

### Phase 6 — Notifications and analytics

- [ ] In-app notifications for meeting lifecycle events
- [ ] Status history views
- [ ] Aggregate administrator analytics (no unrestricted sensitive activity)

### Phase 7 — Quality and deployment

- [ ] Unit, integration, and Playwright tests listed in section 11
- [ ] Accessibility, security, and deployment configuration
- [ ] API, architecture, setup, demo, and limitations documentation

---

## 16. Technical assumptions (to confirm at implementation start)

These assumptions will be used unless product or environment constraints require a change:

1. Local development uses PostgreSQL and fictional seed accounts only. No production URLs, institutional credentials, or live faculty data will be invented.
2. Public QR URLs will be built from a configurable `PUBLIC_BASE_URL` environment variable so the same QR tokens work in local, staging, and production HTTPS deployments.
3. Status is self-reported by the professor. The UI and copy will never present it as GPS-verified or automatically tracked location.
4. One current `professor_statuses` row per professor is authoritative; `status_history` is append-only.
5. Expired statuses remain visible with an explicit stale/expired treatment; they are not shown as confidently current.
6. Email and status-subscription notifications are deferred until the core QR workflow is stable (section 3.8).
7. Scan histories are not stored unless a later justified product requirement is added.
