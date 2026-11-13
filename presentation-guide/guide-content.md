# Find My Professor Presentation Guide
## Project understanding and preparation for judges
Presentation date: 14 November 2026 | Prepared: 13 November 2026 | VNR VJIET campus demonstration

Find My Professor is a mobile-responsive web application that helps students check faculty-reported availability, view consultation hours, identify an office through a QR code, and request a meeting. Teachers control their published information. A PostgreSQL database stores changes, and connected student screens refresh through live events and polling.

This handbook is for the presenting team. Read pages 2 to 15 to understand the system, rehearse pages 16 and 17, and use pages 18 to 23 for questions, checks, and reference. The strongest demonstration is a teacher changing information on one device while a student sees it on another device without reloading.

## Open the application
Public application: https://dt-2026.onrender.com
Student profile for the main demonstration: https://dt-2026.onrender.com/qr/vnr-ananya-reddy
Teacher workspace after login: https://dt-2026.onrender.com/faculty/dashboard

| Role | Demo email | Password |
| Student | student@vnr.demo | DemoPass123! |
| Teacher | ananya.reddy@vnr.demo | DemoPass123! |
| Second teacher | vikram.rao@vnr.demo | DemoPass123! |
| Administrator | admin@vnr.demo | DemoPass123! |

Use separate browsers, browser profiles, or devices for teacher and student accounts. Ordinary tabs in the same browser share the session cookie and cannot reliably represent two different users.

## Readiness that affects the presentation
The hosted app was checked on 13 November: HTTPS, student login, faculty data, and a faculty profile at mobile width worked. The hosted revision reported 48bf797. The local revisions through ec177c3 include the new editable class timetable and live-update fixes; they passed local checks but have not been pushed or deployed. Do not assume the hosted website already includes these additions. Confirm the final deployed revision and rehearse on that exact version before presenting.

The local demo was started at http://localhost:5173. Its lifetime depends on the running computer and process. Restart and verify it before relying on it tomorrow.
---PAGE---
# 1 Project purpose and scope
## The problem in everyday language
A student needs a signature, project review, or doubt clarification. The professor may be teaching, meeting someone, away from the office, or on leave. A nameplate identifies the room but does not communicate current availability. The student may make an unnecessary trip or wait without knowing when to return. Faculty also receive repeated availability questions and unplanned interruptions.

Our design question is: How can students check useful faculty availability information before visiting while allowing teachers to control what they share?

## The proposed solution
The application connects a stable faculty identity to changing information. A student opens the directory or scans the professor's door QR. The profile shows the published status, when it was updated, office details, optional return time, public note, and weekly consultation hours. A signed-in student can bookmark faculty and request a consultation. A teacher publishes status and schedules and responds to requests.

The important distinction is between identity and state. The QR identifies a professor; the database supplies that professor's latest state. The printed QR can remain unchanged while availability changes many times.

## What the prototype establishes
- A working browser-based flow with separate student, professor, and administrator roles.
- Persistent status and schedule information rather than only a static interface.
- Cross-device updates, meeting request handling, in-app notifications, and validation.
- A mobile layout and a public HTTPS deployment that can be opened through a link.

## What it does not establish
The application does not prove the professor is physically present. It has no GPS tracker, occupancy sensor, RFID attendance integration, or verified indoor positioning. Current status is self-reported. Timetable entries describe plans, and an accepted request records agreement rather than automatic attendance.

Treat this as a campus demonstration with a path to a pilot, not an officially adopted institutional service. Demo identities and room assignments are sample data. Do not present the seed roster as an authoritative college faculty database.

## Benefits to describe carefully
The intended benefits are fewer unsuccessful visits, clearer consultation planning, and fewer repeated availability messages. These are project objectives. Any statement about measured time savings, reduced interruptions, or adoption requires actual research evidence.
---PAGE---
# 2 Design thinking and evidence
## Explain the five stages through this project
**Empathize.** Understand the student's uncertainty and the teacher's need for control over interruptions. Useful research questions include how students currently find teachers, how often a visit fails, and how faculty prefer to announce availability. Present genuine interview notes or survey responses if your team collected them.

**Define.** Translate the problem into a focused need: students need timely availability information and a structured way to request a meeting; teachers need a simple publishing workflow with control over public details. Avoid claiming the objective is continuous physical tracking.

**Ideate.** Compare a paper notice, a messaging group, a shared spreadsheet, and a QR-linked web profile. The QR profile is convenient at the office door, the directory supports checking before travel, and meeting requests give the interaction a clear state and history.

**Prototype.** Build the student profile, teacher controls, stored schedules, and consultation workflow. A useful prototype must demonstrate that an authenticated change becomes persistent data and appears to another user, rather than only changing a local screen.

**Test.** Ask students to find a professor and request a future meeting. Ask teachers to change status and publish a slot. Observe task completion, misunderstandings, update delay, and failures. The automated checks in this handbook test software behavior; they are separate from user research.

## A defensible empathy example
Student scenario: 'I need a project review today and do not know whether to walk to the cabin now.' Teacher scenario: 'I want students to know when I am available without repeatedly answering the same message.' Use these as illustrative scenarios unless they are exact quotes supported by your notes.

## Evidence to bring
- A short problem statement and your actual observation or interview notes.
- One clear explanation of a design change made after feedback, if documented.
- The working demo, test results, and a candid list of remaining limitations.
- Team contributions that reflect what each member actually did.

## Review the older slides before presenting
Older presentation notes contain figures such as an 85-plus student survey, 68 percent unsuccessful visits, and 18 to 25 minutes lost. The repository does not establish those measurements. Use them only if the team has the underlying survey and analysis. Similarly, do not claim a measured latency improvement, mentor validation result, or environmental saving without supporting records.
---PAGE---
# 3 Users and feature boundaries
## Student journey
A student can browse or search the faculty directory, filter by department or published status, and open a professor's QR profile. Public information is available without signing in. Student-specific features require a student account: bookmarking, availability subscriptions, meeting requests, viewing personal meetings, and cancellation.

In the profile, the student should read both the status and its freshness. A weekly office-hour window is useful for planning, but it does not guarantee presence. A public note and expected return time provide additional context.

## Teacher journey
A teacher signs in to the faculty dashboard, checks the current published status, and selects a new status. The dashboard supports a public message, optional alternate location, and optional expected return. Teachers can publish weekly office hours and respond to student requests. Recent status history helps explain what changed and when.

The local improved version also includes a separate weekly class timetable editor. A teacher chooses the day and time and enters subject and classroom details in the note field. This feature must be deployed or shown from the verified local version.

## Administrator journey
Administrator routes support faculty onboarding and updates, organizational data such as departments and offices, QR creation and revocation, analytics counts, and audit-log inspection. This is a supporting management flow, not the centerpiece of the student demo. Verify a specific admin action in rehearsal before including it in the presentation.

| Capability | Public visitor | Student | Professor | Administrator |
| View public directory and profile | Yes | Yes | Yes | Yes |
| Request and manage own meetings | No | Yes | No | No student identity |
| Publish own faculty status and hours | No | No | Yes | Separate admin status route |
| Respond to own faculty requests | No | No | Yes | Not the professor workflow |
| Manage faculty and QR records | No | No | No | Yes |

## Account behavior to remember
The server decides permission from the authenticated session. A hidden button is not the permission boundary. Student self-registration creates a STUDENT account; it does not allow a registrant to choose the professor or administrator role. The account switch menu is a demo convenience, not college single sign-on.
---PAGE---
# 4 Technology stack and reasons
The versions below describe the package ranges declared in the repository. They are not a claim about the newest release of each library.

| Layer | Technology | Purpose in this application |
| User interface | React 19 and TypeScript 5 | Component-based screens and typed application code |
| Frontend build | Vite 6 | Development server and optimized frontend bundle |
| Navigation | React Router 7 | Browser routes for directory, profiles, and dashboards |
| Server data | TanStack React Query 5 | Fetching, caching, refetching, and query invalidation |
| Styling | Tailwind CSS 4 and custom CSS | Responsive layouts, controls, and visual styling |
| Icons and scanning | Lucide React and html5-qrcode | Interface icons and browser QR scanning |
| Backend | Node.js and Express 4 | HTTP API, middleware, events, and frontend hosting |
| Validation | Zod 3 | Runtime validation of incoming data |
| Persistence | PostgreSQL and Prisma 6 | Relational storage, typed queries, transactions, migrations |
| Authentication | bcryptjs and opaque cookie sessions | Password hashing and server-side session lookup |
| QR generation | qrcode | Produce a QR image pointing to a stored faculty token |
| Verification | Vitest, Supertest, Playwright | Unit checks, API checks, browser and mobile-width tests |
| Hosting | Render | Existing public HTTPS application deployment |

## Explain the choices without jargon
React lets us reuse controls and keep the interface consistent. TypeScript catches many mismatches during development, while Zod checks actual data arriving at the server. These serve different purposes: a typed frontend does not make untrusted HTTP input safe.

PostgreSQL fits the relationships among students, professors, offices, requests, events, and notifications. Prisma provides a structured way to query those records and apply schema migrations. A database transaction keeps related writes together when an operation must succeed or fail as one unit.

React Query handles server data in the browser. A live event tells it that information may have changed; it fetches the latest response and React renders the result. We do not manually copy a teacher's browser state into every student's screen.

The repository is an npm workspace with frontend, backend, and shared packages. Shared types and status logic reduce inconsistent definitions across client and server. Local demo startup uses embedded PostgreSQL on port 55432; that is development infrastructure, not the hosted database architecture.
---PAGE---
# 5 Architecture and request flow
## Three application layers
**Presentation layer.** A mobile or desktop browser runs the React interface. Pages display data, collect user input, and call relative /api/v1 URLs. Browser routing selects the correct screen.

**Application layer.** Express receives the request, parses JSON and cookies, resolves the session, checks role and ownership, validates the payload, and invokes database operations. Routes separate faculty, QR, meetings, favorites, notifications, and administration.

**Data layer.** PostgreSQL stores persistent records. Prisma supplies query methods and transactions. Changes survive page reloads and ordinary application restarts when the same database remains available.

## A teacher status update through the layers
1. The teacher chooses a status and publishes from the dashboard.
2. The browser sends PUT /api/v1/faculty/me/status with the session cookie.
3. Session middleware identifies the user; role middleware requires PROFESSOR.
4. The route finds the professor linked to that user and validates the request.
5. A transaction upserts current status, appends status history, and records an audit entry.
6. After the transaction commits, the service publishes a campus-change event. Publishing AVAILABLE also attempts notifications for subscribed students.
7. Connected browsers receive the event and invalidate their data queries.
8. Student screens fetch current authorized API responses and re-render.

## Read and write paths
Opening a QR profile reads the QR record and its related professor, department, office, status, and hours. Updating status uses an authenticated write route. The QR itself does not contain a mutable status value or require reprinting after every change.

## Hosting model
In production, Express can serve the built frontend files and the API from one origin. A student opens one HTTPS URL; relative API requests go to that same origin. Vite is the local development server, not a separate production service students need to start.

## A concise architecture explanation
'The browser calls our Express API. The server validates who the user is and what they are allowed to change, saves the change in PostgreSQL through Prisma, then signals connected clients. Clients fetch the saved data and update their displays.'
---PAGE---
# 6 How live updates work
## Server sent events
The browser opens an EventSource connection to GET /api/v1/events. The server replies with text/event-stream and keeps the HTTP connection open. It sends an initial connected event, campus-change events when supported writes finish, and heartbeat comments approximately every 15 seconds.

SSE is a one-way server-to-browser channel. Teacher edits still use normal HTTP requests. This is a good fit because students mainly need to hear that data changed; the application does not need a continuous two-way chat protocol.

## Query invalidation and fresh reads
The LiveSync component listens for campus-change and invalidates React Query's cached queries. Active screens then fetch their data again. The event carries a change signal and timestamp, not private account details or a complete copy of the changed record. Each refetch is still subject to the API's normal access rules.

The event emitter is in the backend process. This works for a single application instance. Multiple independent server instances would need shared messaging, such as database notifications or a broker, to fan events out reliably across instances.

## Recovery mechanisms
- Visible screens have a global two-second polling fallback in the improved version.
- The QR profile also has its own 1.5-second refetch interval; the teacher status query has a two-second interval.
- Focus, visibility changes, reconnecting to the network, and an SSE reconnection trigger refresh behavior.
- BroadcastChannel can signal other tabs on the same browser origin. It does not synchronize separate devices; the server channel and API do that.

These intervals are configuration choices, not guaranteed end-to-end latency. Network speed, browser background throttling, server startup, and database response time affect when the screen changes. A sleeping phone may not update until it wakes.

## What the demonstration should prove
Keep the student page open and touch only the teacher device. Publish a change. The student sees it without manually reloading. Then reload the student page to show the value persisted in the database.

## Remaining efficiency work
Current signals invalidate broadly, and some screens poll independently as well. For a large campus, use targeted invalidation, reduce duplicate polling, measure traffic, and use backoff during failures. Do not claim the current prototype has been load-tested for thousands of simultaneous users.
---PAGE---
# 7 Database structure and relationships
## Identity and organization
User stores login identity, password hash, role, and activation state. Session links a hashed opaque session token to a user and expiry. A Professor belongs to a user, a department, and optionally an office. An Office belongs to a building and has floor and room details.

| Record | Main responsibility | Important relationship |
| User and Session | Authentication and role identity | User has sessions and may have a professor profile |
| Department and Building | Campus organization | Professors belong to departments; offices belong to buildings |
| Office | Room identity and display details | Referenced by professor profiles |
| Professor | Faculty identity and public profile | Connects user, department, office, status, and QR records |
| ProfessorStatus | Latest published availability | One current record per professor |
| StatusHistory | Chronological status changes | Many records per professor and recording user |
| QrCode | Stable token and active or revoked state | Links a public QR token to one professor |
| OfficeHour | Recurring consultation windows | Multiple day and time rows per professor |
| MeetingRequest and MeetingRequestEvent | Current booking state and transition history | Connect student, professor, and acting user |
| Favorite | Bookmark and availability subscription | Unique student and professor pair |
| Notification | Personal in-app messages | Belongs to one user |
| AuditLog | Administrative trace of actions | Actor, action, entity, time, and metadata |
| AppSetting | Keyed JSON settings | Also stores per-professor timetable data in the improvements |

## Why use both current state and history
A directory needs the latest status quickly. A teacher or administrator may also need to inspect earlier changes. ProfessorStatus supports the first task; StatusHistory supports the second. MeetingRequest and MeetingRequestEvent follow a similar pattern for consultations.

## Timetable storage in the improved version
Class slots are stored as JSON in AppSetting under timetable followed by the professor ID. Each entry has dayOfWeek, startTime, endTime, and an optional notes field for subject and room. This requires no additional schema migration. A dedicated ClassSchedule model would be a better next step for richer courses, semesters, indexing, and cross-schedule rules.

## Useful database concepts to explain
A foreign key expresses a relationship. A unique constraint prevents duplicate identities such as the same favorite pair. A transaction groups related writes. Persistence means a value exists independently of the current browser page; it does not mean the system works without a network or database.
---PAGE---
# 8 Status behavior and freshness
## Published availability states
| Stored state | Meaning to explain |
| AVAILABLE | Teacher reports availability for visits or consultation |
| IN_CLASS | Teacher reports teaching or being occupied with class |
| IN_MEETING | Teacher reports a meeting or consultation in progress |
| AWAY | Teacher reports being temporarily away |
| ON_LEAVE | Teacher reports being away for leave |
| UNKNOWN | No confident current availability is established |

## What a status update includes
The teacher can publish the status plus an optional expected return time, alternate location, and public note. The route restricts alternate location to 100 characters and public message to 280 characters. It calculates an expiry using the configured time to live. The default fallback setting is 240 minutes, and an administrator setting can override the default.

The current status, history entry, and audit record are written together. The response includes updatedAt, expiresAt, isExpired, and isConfidentlyCurrent. These help the interface distinguish a fresh report from an old one.

## Explain expiry accurately
An expired record is retained and marked stale. The implementation does not automatically conclude that a professor is available just because a return estimate or expiry time has passed. UNKNOWN is never treated as confidently current. A recently published status remains a report from the teacher, not sensor evidence.

Expected return and expiry answer different questions. Expected return is the teacher's estimate of when they may be back. Expiry is the system's freshness limit for the published report. Neither guarantees that a meeting can start at that time.

## Automatic versus manual behavior
Student screens update automatically after a teacher publishes. The normal server startup does not start the old timetable simulation worker. An administrator-only simulation route exists in the repository, but the current user-facing status is teacher-controlled. Do not say the app senses teaching activity or derives live status from the newly edited class timetable.

## Demonstration sequence
Publish AVAILABLE, then IN_CLASS with a note such as 'Teaching Algorithms in Room 201; please return in 15 minutes.' Show the badge, note, update time, and history. Publish AVAILABLE again if you want to demonstrate an in-app availability notification for a subscribed student.
---PAGE---
# 9 Timetable and consultation hours
## Three different time concepts
**Class timetable:** recurring teaching plans, including a day, time range, and a note describing the subject and classroom. The new editor persists this information and displays it on the student's profile.

**Office hours:** recurring consultation windows during which a teacher plans to be available for students. These are stored as OfficeHour rows and used to display the next posted consultation window.

**Meeting request:** a specific proposed date and time between a student and teacher. It becomes an accepted appointment only after the teacher accepts. It is not the same as a recurring schedule row.

## Teacher editing workflow
1. Open the teacher dashboard and locate Weekly office hours or Weekly class timetable.
2. Add a slot or edit an existing one. Choose the day, start, and end time.
3. Add a location or helpful note. For a class, use the note for subject and classroom.
4. Select the appropriate Publish button. Draft edits are not published until saving succeeds.
5. Confirm the success message, then inspect the student screen without refreshing.
6. Reload once to establish persistence. Demonstrate removing a slot if time permits.

## Validation and storage rules
Days are integers 0 to 6, with Sunday as 0. Times use a 24-hour HH:MM format. End must be after start. Overlapping entries in the same submitted schedule on the same day are rejected; adjacent windows and the same time on different days are allowed. The schema allows up to 35 entries and a note up to 200 characters. Overnight slots must be represented differently because an end earlier than start is invalid.

Office-hour replacement occurs in a transaction. Improved timetable saves also use a transaction and record an audit entry. A published empty office-hour schedule is marked so demo seeding does not silently restore default rows on restart.

## Boundaries to explain to judges
The prototype does not enforce a combined conflict rule across classes, office hours, and meetings. Meeting requests may be proposed outside office hours and still require teacher approval. Slots are recurring IST planning windows, not an automatically generated university timetable. There is no semester scheduler, classroom allocation optimizer, or automatic free-slot booking engine.
---PAGE---
# 10 Consultation requests and notifications
## Request creation
A signed-in student selects Request Meeting on a professor's profile, enters a reason, future date, start time, duration, and optional note, then submits. The frontend interprets the requested time in IST and sends ISO date-time values to the API.

The server requires a student role, validates the fields, confirms the professor is visible and active, rejects past start times and non-positive durations, and checks for overlap with that professor's accepted meetings. A valid request is stored as PENDING. A request event and a notification for the professor are created in the same transaction.

## Teacher response
The professor's dashboard shows the queue. Accepting changes the request to ACCEPTED; declining changes it to DECLINED. The response route verifies that the request belongs to the signed-in teacher, checks allowed state transitions, appends an event, and creates a student notification. The improved version also broadcasts the completed change immediately.

The backend contains PROPOSE_RESCHEDULE and COMPLETE actions, but the main teacher screen currently exposes Accept and Decline for pending requests. The student screen supports cancellation. Do not demonstrate a complete rescheduling negotiation as though the UI implements it end to end.

## States to recognize
PENDING means awaiting a decision. ACCEPTED means approved. DECLINED means refused. CANCELLED means cancelled by the student. COMPLETED is a backend-supported completed state. RESCHEDULE_PROPOSED is a backend-supported proposed change. A stored state name does not by itself prove every transition has a finished interface.

## Overlap rule
Two ranges overlap when the existing start is before the new end and the existing end is after the new start. This allows adjacent meetings. Overlap with accepted meetings is checked during creation and teacher acceptance.

The current checks are application-level queries. Concurrent acceptance of competing requests needs stronger database enforcement or serializable transactions with retry before a large deployment. Do not claim a fully proven concurrency-safe booking engine.

## Notifications
Notifications are stored per user and shown inside the application. Users can mark individual or all messages read. Bookmarked faculty can have availability notifications enabled; publishing AVAILABLE attempts to notify subscribed students. Notification delivery in that availability path is best effort and can repeat if AVAILABLE is published repeatedly. There is no email, SMS, or native push delivery in the current implementation.
---PAGE---
# 11 QR codes and mobile access
## What is inside the QR
A QR image encodes a URL containing a stable token, such as /qr/vnr-ananya-reddy. PostgreSQL stores the token-to-professor relationship and whether the QR is active. The QR is an entry point to a current online profile. It does not contain the professor's latest availability or private login credentials.

Scanning with the phone's native camera opens the URL in a browser. The application requests the linked professor's public data and displays it. Changes to status or office hours appear through API refreshes while the QR image stays unchanged.

## Supported entry methods
- Open the website and search the directory.
- Open a direct professor profile link.
- Scan a printed door QR with the phone camera.
- Use the application's scanner on a supported browser.
- Use QR image upload or demo QR options if live camera access is unavailable.

## Mobile requirements
The hosted application uses HTTPS, which is the appropriate context for browser camera permission. The user must grant camera access, and camera behavior still depends on the device and browser. Automated mobile-width checks verified layout and application behavior; they did not prove the physical camera works on every phone.

The Render URL can be used from different networks. A local LAN URL requires the phone and laptop to reach each other, usually on the same Wi-Fi. The local demo last printed http://192.168.29.62:5173, but the IP may change. Guest networks can block device-to-device access. A phone's localhost address refers to that phone, not the presenting laptop.

## Print and revoke behavior
The QR gallery and print-sign page support stable door identifiers. Before printing, verify that the encoded link uses the intended public deployment address rather than an old local address. An administrator can revoke a QR; the server can then show the QR as revoked instead of serving it as an active identity.

## Describe the hardware requirement precisely
The prototype needs a printed QR and a web-capable phone or computer. A screen can show a digital placard. There is no implemented microcontroller, e-ink display controller, or IoT sensor integration. Such hardware can be future work, not a requirement to demonstrate the current system.
---PAGE---
# 12 Authentication security and privacy
## Login and sessions
The server looks up the email and compares the submitted password with a bcrypt hash. Passwords are not meant to be stored in plain text. Successful login creates a random opaque session token. The browser receives the raw token in the wimp_session cookie, while the database stores its SHA-256 hash and an expiry.

The default session duration is seven days. The cookie is HttpOnly, SameSite Lax, and Secure when configured for the production environment. HttpOnly helps prevent ordinary JavaScript from reading the cookie. HTTPS protects the connection, but it does not replace application authorization.

## Permission checks
Session middleware resolves the user from the cookie. requireAuth rejects unauthenticated writes. requireRole rejects a role that is not permitted for the route. Faculty routes look up the professor linked to the signed-in user; a request response must belong to that teacher. Student cancellation checks request ownership. Notification reads are filtered by the logged-in user.

HTTP 401 means the requester lacks a valid authenticated session. HTTP 403 means a recognized user lacks permission. HTTP 400 indicates invalid input, and HTTP 409 is used for conflicts such as a booking overlap or an invalid transition.

## Input and public data
Zod validates request structure, enums, lengths, and time fields. Public faculty information is deliberately separate from private account records. The live event stream sends a general change signal, not a dump of student meetings. Office locations and alternate locations are published text; the app does not continuously collect physical movement.

## Limits before a real college launch
Demo accounts use a shared known password and quick role switching, so they are unsuitable for production identity. Student registration does not verify institutional affiliation. College SSO, controlled onboarding, login throttling, explicit origin configuration, backup policy, monitoring, and a full security and privacy review remain necessary.

Helmet and CORS middleware exist, but their presence is not a security certification. Content Security Policy is disabled in the current app setup. The deployment debug endpoint exposes operational metadata and should be restricted or removed before a production rollout. The current SESSION_SECRET setting should not be described as JWT signing: the implemented session design uses random tokens and database lookup.
---PAGE---
# 13 Deployment and local operation
## The hosted deployment
The Render configuration describes a Node web service and PostgreSQL database. The build script installs dependencies, generates Prisma Client, runs TypeScript checks, and builds the frontend. The production start script applies migrations, ensures demo accounts, and starts the Express server. The backend entry point also repeats some setup steps; this is a simplification opportunity.

Express serves the frontend bundle when present and exposes API routes on the same host. Render provides the external URL and listening port through environment variables. The application binds to 0.0.0.0 so it can receive hosted traffic.

Important variables include DATABASE_URL, PORT or API_PORT, NODE_ENV, COOKIE_SECURE, PUBLIC_BASE_URL, FRONTEND_ORIGIN, and STATUS_DEFAULT_TTL_MINUTES. Do not show private environment values in a presentation. PUBLIC_BASE_URL affects public links; FRONTEND_ORIGIN affects accepted browser origins.

## Starting the local demo
Run the following from the inner project directory named dt_2026, the directory containing package.json:

```text
npm install
npm run demo
```

The demo runner starts or connects to embedded PostgreSQL at localhost:55432, applies migrations, provisions sample users, starts the API at port 4100, and starts Vite at 5173 or another available port. Read the actual printed URL. Persistent local data lives in .demo-pgdata. Keep the terminal running.

## Checks to know
```text
npm test
npm run build
npm run demo:verify
node scripts/verify-dynamic-mobile.mjs
node scripts/verify-hosted-mobile.mjs
```

The end-to-end demo checks need the local app running. The dynamic mobile check temporarily edits demo status and schedules and restores them in cleanup. It leaves audit records. The hosted smoke check signs in and reads the deployed app; it does not deploy it.

## Avoid destructive preparation
Do not run db:reset, prisma migrate reset, or the legacy seed against the database used for tomorrow's demonstration. Do not delete .demo-pgdata to fix an ordinary login or networking issue. If a Prisma Client generation step fails on Windows because the query-engine DLL is in use, stop the relevant local backend before rebuilding; do not erase the database.
---PAGE---
# 14 API and source code reference
All paths below are relative to /api/v1. These are useful when judges ask where a feature is implemented; you do not need to recite every path.

| Method and path | Responsibility |
| POST /auth/login and /auth/register | Sign in or create a student account |
| GET /auth/me and POST /auth/logout | Resolve or end the current session |
| GET /faculty | Search and filter public faculty with pagination |
| GET /faculty/:slug | Read a public faculty profile |
| GET /qr/:token | Resolve a stored QR identity and current profile data |
| GET /events | Maintain the server-sent event connection |
| GET and PUT /faculty/me/status | Read or publish the teacher's status |
| GET /faculty/me/status/history | Read the teacher's status history |
| GET /faculty/me/schedules | Read the teacher's stored consultation and class slots |
| PUT /faculty/me/office-hours | Replace recurring office hours |
| PUT /faculty/me/timetable | Publish class slots in the improved version |
| GET /faculty/:slug/timetable | Read published class slots in the improved version |
| POST /meetings and GET /meetings/mine | Request a meeting or list the student's meetings |
| PATCH /meetings/:id/cancel | Cancel an owned student request |
| GET /faculty/me/requests | Read the professor's consultation queue |
| PATCH /faculty/me/requests/:id | Respond to a professor-owned meeting request |
| GET /notifications | Read the signed-in user's in-app notifications |
| GET /admin/audit-logs | Inspect audit records as an administrator |

## Where to look in the repository
frontend/src/pages contains the directory, QR profile, dashboards, login, and student portal. frontend/src/components contains LiveSync, OfficeHoursEditor, NextAvailability, ConsultationModal, scanner, and shared UI. frontend/src/lib/api.ts centralizes HTTP calls.

backend/src/routes contains the API handlers. backend/src/services/status-service.ts implements status persistence and history. live-updates.ts implements the process-local change emitter. office-hours.ts contains recurring-slot validation. middleware/auth.ts contains session and role helpers.

backend/prisma/schema.prisma defines the database model; migrations contains schema history. shared/src contains reusable enums, types, and status freshness logic. scripts contains startup, demo, verification, and presentation support scripts. render.yaml describes the intended Render services.
---PAGE---
# 15 Seven minute live demonstration
## Before the timer starts
Use the verified deployed version or the verified local version, consistently. Keep teacher dashboard on the laptop and the student profile on a phone or separate browser profile. Choose a professor and future meeting time that are not already involved in a conflict. Open the QR page before the judges arrive.

| Time | Action | What the audience should observe |
| 0:00 to 0:45 | State the problem and open the student profile | Faculty identity, office, status, and last update are visible |
| 0:45 to 1:45 | Publish IN_CLASS with a distinctive note on the teacher device | Student badge and message change without a reload |
| 1:45 to 2:45 | Change and publish one office-hour slot | Student sees the new day, time, and note |
| 2:45 to 3:45 | Publish one class timetable slot if the improved version is available | Student class timetable changes automatically |
| 3:45 to 4:45 | Student requests a future consultation | Teacher queue shows a pending request |
| 4:45 to 5:45 | Teacher accepts the request | Student meeting state and in-app notification update |
| 5:45 to 6:30 | Reload student profile and show teacher status history | Values remain stored; the update has a recorded history |
| 6:30 to 7:00 | Explain architecture and limitations | Clear account of persistence, live sync, and self-reported status |

## Exact narration for the main moment
'Please watch the student's phone. I am changing only the teacher's screen. I will publish In Class and a note about the room. The server saves that report, then signals connected browsers. The student's profile now shows the change without a manual refresh. I will reload once to show this is stored data rather than only a temporary screen change.'

## If timetable improvements are not deployed
Demonstrate the existing office-hour update on the hosted application. If showing the new class editor from the laptop's local version, explicitly identify it as the improved local build. Do not silently switch between versions or claim an unavailable feature is live.

## Keep the demo controlled
Use short, distinctive notes such as 'Judge demo 10 AM'. Explain one change at a time. Do not edit every professor, intentionally break the network, or run destructive database commands during the presentation. Restore the sample state after rehearsal so tomorrow's queue is understandable.
---PAGE---
# 16 Speaking plan and project explanation
## Opening script of about one minute
'Good morning. Our project is Find My Professor, a web application for checking faculty availability and planning consultations. A student may reach a cabin without knowing whether the professor is teaching, in a meeting, or away. A static nameplate cannot answer that question. Our application gives each professor a QR-linked profile and a directory entry. Teachers publish their own status and office hours, and students can request a meeting. Today we will demonstrate a teacher changing information while a student sees the update on a separate device.'

## Technical explanation of about one minute
'The interface uses React and TypeScript. Express on Node.js provides the API, and PostgreSQL stores users, faculty, schedules, requests, and history through Prisma. A teacher's change passes server-side login, role, ownership, and input checks. Related records are written in a transaction. After saving, a server-sent event tells connected clients to fetch fresh data. Polling and focus refresh help recover when that connection is unavailable. The QR identifies the professor, while the current information comes from the database.'

## Closing script of about thirty seconds
'Our demonstration shows persistent faculty updates, a student-facing mobile profile, and a consultation request moving from pending to accepted. The current availability is reported by faculty, so we show freshness and do not claim physical tracking. Our next step is a controlled campus pilot with verified identities, stronger concurrency protection for bookings, and measured usability feedback.'

## Suggested team handoffs
Assign one presenter to problem framing and design thinking, one to the teacher device, one to the student device and user journey, and one to architecture, testing, and questions. Adapt these roles to your actual team size and contribution. Every member should be able to explain the core live-update path.

Rehearse the transition sentence: 'Now that you have seen what the student experiences, my teammate will show what happens in the backend when the teacher presses Publish.'

## Facts every member should know
- The main goal is availability communication and consultation planning.
- A QR is a stable link; it does not store the changing status.
- Live updates use SSE with refetch and polling, not WebSockets.
- PostgreSQL is persistent storage; React Query is a browser data cache.
- Availability is self-reported; timetable plans do not prove presence.
- A requested meeting is not accepted until the teacher approves it.
---PAGE---
# 17 Judge questions about the product
## Why do students need this when they can message a teacher
A message is useful for personal communication, but the same availability question can be repeated by many students. A shared profile lets a teacher publish one update, and requests provide a visible pending or accepted state. We still need a pilot to measure whether users prefer and maintain it.

## What is innovative about this project
Our contribution is the campus workflow: stable door QR identity, a searchable profile, faculty-controlled availability, recurring hours, and consultation requests connected to persistent data and live updates. We are applying established web technologies to a specific user problem; we do not claim to have invented QR codes or SSE.

## Does the app track the professor
No. It displays the office and any alternate location a professor chooses to publish. There is no GPS, occupancy sensor, or continuous movement tracking.

## What if the professor forgets to update the status
The freshness fields show when the report was updated and whether it has expired. An old AVAILABLE report must not be treated as proof of presence. Future work could add reminders and verified calendar integration, with faculty consent.

## Does a timetable change automatically switch the status
No. The current app keeps teacher-reported live status separate from recurring planning information. Student screens refresh automatically when data changes, but the new class timetable is not an automatic status engine.

## Can a student book outside office hours
The current workflow allows a future consultation proposal outside recurring office hours. The teacher must accept it. We should make this policy clear rather than implying that every published hour is an instant booking slot.

## Does it work without internet
The prototype needs a connection to read fresh data and save changes. It is mobile-responsive, but we do not claim an offline PWA or a native app. A saved screenshot can explain the interface during an outage but cannot demonstrate live synchronization.

## What happens if a student scans an old printed QR
If the stored token remains active, the QR opens the professor's latest profile. A revoked token is handled as revoked. If the app domain changes, the team must preserve redirects or issue a new printed link; a stable token alone cannot preserve a discontinued domain.

## Is it officially used by the college
This is a student project demonstration. Institutional adoption, verified onboarding, privacy approval, support, and an operational policy would be needed before presenting it as a college service.
---PAGE---
# 18 Judge questions about implementation
## Why SSE instead of WebSockets
The live requirement is mainly one-way: tell browsers that a server record changed. SSE uses a browser EventSource connection for that. Edits still travel through ordinary HTTP. A future chat or more interactive bidirectional feature could justify another transport.

## How do you know the data really changed in the database
The student fetches a new API response after publishing, and reloading shows the same value. Status also has history and audit records. The automated workflow checks read the data through independent user-facing endpoints rather than only trusting the teacher's success message.

## What prevents a student from editing faculty data
The write endpoint requires an authenticated professor role. The server identifies the professor from the session's user ID, rather than accepting an arbitrary professor identity from the browser. A student request to the timetable write route was verified to return 403.

## Why TypeScript and Zod together
TypeScript checks source code types during development. HTTP payloads arrive at runtime and can come from a caller other than our frontend. Zod validates those values at the server boundary.

## Why Prisma if you already use PostgreSQL
PostgreSQL is the database. Prisma is the application data-access layer that provides generated query types, model mapping, migrations, and transaction APIs. They solve different parts of the storage problem.

## How is the same professor linked across pages
The professor has a persistent database ID and slug. A QrCode record maps its stable token to that professor. Directory, slug profile, QR profile, status, and schedules resolve records for that identity.

## Are all changes audited
No blanket claim should be made. Status changes have history and audit records; login and registration are audited; the improvements add office-hour and timetable audit records. Meeting transitions use MeetingRequestEvent. Audit coverage and retention need review before production.

## Can two requests be accepted for the same time
Normal sequential conflicts are checked and rejected. Simultaneous acceptance under concurrency needs stronger database-level exclusion or serializable retry. That limitation is part of the production roadmap.

## Can the system handle many server instances
The database is shared persistent storage, but the live event emitter is process-local. Multiple instances need a shared event distribution mechanism. The current demo does not establish large-scale capacity.

## Do notifications always succeed
Meeting updates and their notifications are written together in transactions. Availability notifications run after the status transaction and failures are logged without undoing the status. They are in-app records, not guaranteed external delivery.
---PAGE---
# 19 Testing evidence and practical limits
## Checks completed on 13 November
The local automated test suite passed 11 tests: five shared status tests, three office-hour validation tests, and three foundation API tests. These cover important rules but are not a complete test of every feature or a security assessment.

Shared, backend, and frontend TypeScript checks passed, and the Vite production frontend build completed. A full root build attempt encountered a Windows query-engine DLL lock while the backend was running; the package-level compiler and frontend build checks succeeded separately. Keep that distinction if discussing the exact build command.

## Local workflow verification
The demo verification script passed checks for at least 20 faculty with unique QR identities, professor-to-public status propagation, role restrictions, office-hour persistence and overlap validation, meeting approval, student updates, notifications, sequential conflict rejection, cancellation, and invalid QR handling.

The mobile browser script used separate teacher and student contexts at 390 by 844 pixels. It exercised the teacher timetable editor and confirmed student timetable updates without a reload. It also confirmed live status and office-hour updates, persistence after reload, invalid timetable rejection, forbidden student writes, no detected horizontal overflow, and no JavaScript page crashes in the exercised flow.

An additional run blocked the SSE endpoint and confirmed that the student screen still received a changed status through polling. One test assertion was corrected because the AVAILABLE layout wraps the public note in quotation marks; the actual updated text was already present.

## Hosted checks
The existing Render site returned HTTP 200 for the app and a successful API health response. Public faculty data was readable. A hosted mobile-width browser check passed student login, navigation, and professor profile rendering without detected page crashes. The hosted revision was still the older version, so these checks do not certify the new local timetable feature on Render.

## What remains unmeasured
There is no established load-test result, availability SLA, measured campus time saving, physical-camera coverage across devices, accessibility certification, penetration test, or concurrency proof. Browser automation at a phone-sized viewport is useful evidence, but tomorrow's actual phone, camera, and network need a rehearsal.

For a pilot, record task completion, observed delay from publish to display, stale-data misunderstandings, successful consultations, teacher update compliance, and user feedback. State sample size and conditions before reporting results.
---PAGE---
# 20 Preparation and recovery checklist
## Tonight
- Decide which version will be demonstrated. The new class timetable requires the improvements to be deployed or the local build to be used explicitly.
- Open the real URL on the actual phone, confirm login, and rehearse with separate teacher and student sessions.
- Print or display the correct professor QR and test the encoded domain.
- Prepare a distinctive status note and one future meeting time; clear up confusing rehearsal requests through ordinary app actions.
- Charge devices and prepare a charger, network backup, screenshots, and the slide deck. Keep passwords available to the presenters.
- Assign who controls each device and who explains each stage. Run the seven-minute script twice.

## Fifteen minutes before judging
Open the hosted site and log in early. Confirm the teacher queue, office-hour editor, and student profile. Publish a fresh report so seeded or previous-day statuses do not begin the demo as expired. Verify the student's phone sees a change. Check the timetable editor exists if it is part of your script. Keep the appropriate app terminal open if using the local build.

## If the student screen does not change
Check that both devices point to the same deployment and the same professor. Confirm the teacher save succeeded. Bring the student page to the foreground, check connectivity, and wait briefly. Reload if necessary and say that you are distinguishing stored data from the live connection. A successful reload proves persistence, not uninterrupted event delivery.

## If login changes in another tab
The two tabs probably share a browser session. Use another browser, a separate browser profile, an isolated private session, or another device. Do not keep switching roles in one shared cookie session while trying to demonstrate simultaneous users.

## If the hosted site starts slowly
Allow it to finish loading and verify health before starting the timed demonstration. Do not promise a fixed startup delay. Use the rehearsed local build if it is available and clearly identify that change of environment.

## If camera or meeting submission fails
For the camera, check permission and HTTPS, then use the native camera or direct profile link. For a meeting, choose a future time, confirm end is after start, and check for an existing accepted overlap. Avoid spending the presentation debugging an unrelated device setting.
---PAGE---
# 21 Roadmap and responsible claims
## Next engineering steps
For a campus pilot, replace demo identity with college-controlled authentication, define who can onboard faculty, and verify institutional affiliation. Review public fields, consent, retention, logs, and support responsibilities with the college.

Strengthen consultation concurrency using a database exclusion constraint or serializable transactions with retry. Model class schedules as dedicated records if courses, semesters, or classroom constraints grow. Define an explicit policy for overlap among teaching plans, office hours, and appointments.

For reliability, use shared event distribution across instances, targeted refreshes, lower duplicate polling, failure backoff, database backups, and monitoring. Verify behavior under real network interruption and recovery. Protect deployment diagnostics and review origins, throttling, and security headers.

For usability, collect actual student and faculty feedback, test keyboard and screen-reader flows, and rehearse camera access on several real devices. Calendar integration, consent-based reminders, email or push delivery, and hardware placards are possible future features rather than completed work.

## Claims to use and claims to qualify
| Safe description | Qualification to keep |
| Live student updates after teacher publishing | Depends on connection; polling and refocus help recovery |
| Data persists in PostgreSQL | Needs the database and network; no offline guarantee |
| Mobile-responsive web application | Does not establish a native app or offline PWA |
| Faculty-controlled availability | Self-reported, not verified physical presence |
| Conflict checks for accepted meetings | Sequential behavior verified; concurrency strengthening remains |
| Improved editable class timetable | Locally verified; deployment was still pending at preparation |
| Expected to reduce wasted visits | Needs a real pilot to measure actual impact |
| QR-linked digital faculty profile | No implemented IoT sensing hardware is required |

## If asked about AI assistance or contributions
Describe the development process honestly. Explain what the team designed, implemented, reviewed, and tested, and disclose assistance if asked or required by the evaluation rules. Do not assign invented research, coding, or validation contributions to members. Every presenter should understand the final behavior they demonstrate.

## Closing principle
The most convincing presentation is one reproducible user journey with a clear technical explanation and well-understood limits. A smaller feature shown working across devices is stronger evidence than an unsupported claim about scale, automation, or measured impact.
---PAGE---
# 22 Glossary and source reference
## Terms in plain language
**API:** the server endpoints the browser uses to request or change data. **Authentication:** establishing who the user is. **Authorization:** deciding what that user may do. **Session:** a stored login relationship identified by an opaque cookie token.

**SSE:** a persistent HTTP stream for server-to-browser events. **Polling:** repeated requests to check for changes. **Cache invalidation:** marking previously fetched data as needing a fresh read. **BroadcastChannel:** browser communication among same-origin contexts, useful for tabs on one device.

**ORM:** an application layer for working with database records; Prisma fills this role here. **Migration:** a versioned database schema change. **Transaction:** a group of writes that commits or rolls back together. **Foreign key:** a database relationship to another record.

**TTL:** time to live, used here to determine status freshness. **IST:** India Standard Time, UTC plus 05:30. **Slug:** a readable identity in a URL. **QR token:** a stored public identifier that resolves to a professor. **HTTP origin:** the scheme, host, and port of a website.

## Repository references for deeper questions
| Topic | Source files |
| Project commands and dependencies | package.json; frontend/package.json; backend/package.json |
| Browser routes and role screens | frontend/src/App.tsx; frontend/src/pages |
| Live synchronization | frontend/src/components/LiveSync.tsx; backend/src/services/live-updates.ts; backend/src/app.ts |
| Status and expiry | backend/src/services/status-service.ts; shared/src/status.ts; shared/src/enums.ts |
| Timetable and office-hour publishing | backend/src/routes/faculty.ts; backend/src/services/office-hours.ts; frontend/src/components/OfficeHoursEditor.tsx |
| Meetings and notifications | backend/src/routes/meetings.ts; backend/src/routes/faculty.ts; backend/src/routes/notifications.ts |
| Session and password handling | backend/src/middleware/auth.ts; backend/src/routes/auth.ts |
| Data model and migrations | backend/prisma/schema.prisma; backend/prisma/migrations |
| Deployment and startup | render.yaml; scripts/prod-start.mjs; backend/src/config/env.ts; scripts/demo.mjs |
| Reproducible checks | scripts/verify-demo.mjs; scripts/verify-dynamic-mobile.mjs; scripts/verify-hosted-mobile.mjs |

This guide describes the source and checks available on 13 November 2026. Recheck the deployed version before the 14 November presentation. Older slide material is useful for structure and assets, but its numerical research claims and future-feature language need independent evidence before being presented as completed results.
