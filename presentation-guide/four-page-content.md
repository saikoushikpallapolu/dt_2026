# Find My Professor Presentation Guide
## Project overview and purpose
Find My Professor is a mobile-responsive web application for checking faculty availability and arranging consultations. A student can search the directory or scan a professor's door QR code, check the published status and office hours, and request a meeting. Teachers control their information, and changes appear on connected student screens without a manual reload.

**Application:** https://dt-2026.onrender.com
**Main demo profile:** https://dt-2026.onrender.com/qr/vnr-ananya-reddy

## Problem and proposed solution
A student may walk to a cabin only to discover the professor is teaching, in a meeting, or away. A static nameplate identifies the office but cannot explain current availability. Repeated personal messages also create interruptions for faculty.

The solution combines a searchable directory, a stable QR-linked profile, teacher-controlled updates, recurring consultation hours, and structured meeting requests. The intended benefit is better planning and fewer unnecessary visits. Actual time savings require a measured campus pilot; do not present unsupported survey figures as project results.

## Users and main features
- **Students:** Search and filter faculty, view office details and current status, scan QR codes, bookmark professors, subscribe to availability notifications, request future meetings, and track or cancel their requests.
- **Teachers:** Publish availability, notes, alternate location, and return estimates; edit weekly office hours and class timetable; accept or decline consultation requests; inspect recent status history.
- **Administrators:** Onboard and manage faculty, departments, buildings, and offices; generate or revoke QR identities; inspect analytics counts and audit records.

## Design thinking explanation
**Empathize:** Understand student uncertainty and faculty interruptions. **Define:** Make availability easier to check while preserving teacher control. **Ideate:** Compare paper signs, messaging, and a shared QR profile. **Prototype:** Build the student profile, teacher dashboard, schedules, and request flow. **Test:** Verify tasks across separate teacher and student sessions, then collect real user feedback.

## Scope and key distinction
The QR identifies the professor; changing information is fetched from the database. Printing a new QR is unnecessary for each status change. Availability is **self-reported**, not GPS, attendance, or occupancy sensing. A timetable describes planned activity and does not prove physical presence. The product is a working demonstration, not an officially adopted college service or a native mobile app.

**Core message:** We connect a teacher's published availability to a student's decision about when to visit, with persistent data and live updates.
---PAGE---
# Technology stack and architecture
## Technology choices
| Component | Technology | Why it is used |
| User interface | React and TypeScript | Reusable screens and compile-time type checks |
| Styling and build | Tailwind CSS and Vite | Responsive layout and frontend bundling |
| Navigation and server data | React Router and React Query | Page routing, fetching, caching, and refetching |
| Backend API | Node.js and Express | Handle requests, permissions, and application logic |
| Persistent storage | PostgreSQL and Prisma | Relational data, queries, migrations, and transactions |
| Validation | Zod | Validate real incoming payloads at runtime |
| Authentication | bcryptjs and cookie sessions | Hash passwords and maintain server-side login sessions |
| Live synchronization | Server Sent Events and polling | Signal changes and refresh connected screens |
| QR functionality | qrcode and html5-qrcode | Generate profile codes and support scanning |
| Hosting and checks | Render, Vitest, Supertest, Playwright | Public HTTPS hosting, unit/API checks, and browser testing |

## How the layers communicate
1. **Browser:** React displays the interface and sends requests to /api/v1 endpoints.
2. **Server:** Express identifies the user, checks role and record ownership, and validates submitted data with Zod.
3. **Database:** Prisma reads or saves PostgreSQL records. Transactions keep related changes together.
4. **Live refresh:** After a supported change commits, the server broadcasts a campus-change event. React Query fetches fresh data and React updates the screen.

SSE uses an open HTTP connection from server to browser. Teacher edits use ordinary HTTP requests; this is not a WebSocket implementation. Visible screens also poll, and focus or reconnection can trigger refreshes. The improved global fallback runs every two seconds; some pages have their own intervals. Network delay and background browser throttling affect timing, so updates are not a guaranteed latency SLA.

## Important stored records
Users and sessions handle identity. Professors connect departments, buildings, offices, QR codes, status, schedules, and meetings. ProfessorStatus holds the latest report; StatusHistory records previous reports. MeetingRequest holds the current request state, while MeetingRequestEvent records transitions. Favorites, Notifications, and AuditLog support subscriptions and traceability.

Office hours use OfficeHour rows. The improved class timetable uses per-professor JSON records in AppSetting with day, start time, end time, and notes for subject and room. PostgreSQL provides persistence across page reloads; React Query's browser cache is not the permanent database.
---PAGE---
# User workflows and application rules
## Faculty status and student updates
The teacher selects Available, In Class, In Meeting, Away, or On Leave and optionally enters a note, alternate location, and return estimate. Publishing sends an authenticated request. The server saves current status, history, and an audit entry in a transaction, then signals connected clients to refetch.

The student sees the saved badge, message, and update time without reloading. Status includes an expiry; the default fallback time to live is 240 minutes. An expired report is marked stale rather than automatically treated as available. Expected return is an estimate, not confirmation of presence. Publishing Available also attempts in-app notifications for subscribed students.

## Timetable and office hours
The teacher adds, edits, or removes a weekly slot, selects the day and start/end time, enters a note, then presses the relevant Publish button. Students see the revised schedule and the next posted consultation window. Draft edits are not public until saved.

Times use a 24-hour HH:MM format and weekly planning is in IST. End must be after start. Overlaps within the same submitted schedule on the same day are rejected; adjacent slots are allowed. The improved timetable and office-hour writes include audit records.

Keep three concepts separate: **class timetable** is planned teaching; **office hours** are recurring consultation windows; **meeting requests** are dated proposals requiring approval. The prototype does not automatically change live status from the class timetable or enforce combined conflicts across all three schedules.

## Consultation request and response
1. The signed-in student chooses Request Meeting, enters a reason and a future date/time, and submits.
2. The server validates the request and checks for overlap with the professor's accepted meetings. A valid request becomes **Pending**, with an event and teacher notification.
3. The teacher's queue shows the request. Accept changes it to **Accepted**; decline changes it to **Declined**.
4. The student sees the updated state and an in-app notification. Cancellation records a **Cancelled** transition and notifies the teacher.

Creation and acceptance both check accepted-meeting overlap. Sequential conflicts were verified; simultaneous competing approvals need stronger database enforcement before production scale. Backend states for rescheduling and completion exist, but the main teacher interface exposes Accept and Decline. Do not claim a finished rescheduling negotiation UI.

## QR and access workflow
A stored QR token resolves to a public faculty profile. Students can use a native phone camera, the app scanner, or a direct link. HTTPS and camera permission are needed for browser camera access. Public profiles can be read without login; bookmarks and meeting requests require a student account. Use separate devices or browser sessions for simultaneous teacher and student roles.
---PAGE---
# Demonstration and presentation preparation
## A clear five minute demonstration
1. **Introduce the problem:** Open the student profile and explain why checking availability before visiting helps.
2. **Show live status:** On the teacher device, publish In Class with a distinctive room note. Ask judges to watch it appear on the student's phone without a reload.
3. **Show schedule changes:** Edit and publish an office-hour slot. If available on the chosen build, publish a class timetable entry too. Show the student's revised data, then reload once to demonstrate persistence.
4. **Show consultation handling:** Submit a future meeting request as the student, accept it as the teacher, and show the student's updated request and notification.
5. **Explain the mechanism:** Login and validation, database transaction, change event, fresh API read, screen update. Show status history if time permits.

## Access and preparation
**Teacher:** ananya.reddy@vnr.demo | **Student:** student@vnr.demo
**Password for both:** DemoPass123!

Before presenting, test the actual phone and network, publish a fresh status, choose a future meeting time without a conflict, and confirm both devices use the same app version and professor. App improvements were committed and pushed; confirm Render has deployed them before relying on the new timetable editor. Keep the QR link and screenshots ready as fallbacks.

For a local backup, run **npm install** and **npm run demo** from the inner dt_2026 project folder and keep the terminal open. Read the printed Vite URL. Phone access to the local app needs a reachable LAN address; localhost on a phone refers to that phone. Avoid database reset commands before the demo.

## Security and verification
Passwords use bcrypt hashes. Random session tokens are sent in HttpOnly cookies; the database stores token hashes. Server-side role and ownership checks prevent a student from publishing faculty data. Zod validates inputs. Production cookies use HTTPS settings, but demo credentials must be replaced for real institutional use.

Eleven unit and foundation API tests passed. Local workflow checks verified status and schedule persistence, permissions, meeting approval, notifications, and conflicts. Separate mobile-width browser sessions verified timetable updates, polling recovery with SSE blocked, and no detected page crashes or horizontal overflow in the tested flow. These checks do not establish campus-scale capacity or every phone's physical camera behavior.

## Short answers for judges
**Why SSE:** The main live requirement is one-way server updates; edits use regular HTTP. **Why PostgreSQL:** The project has related users, faculty, schedules, requests, and history. **What if status is old:** Show freshness and mark it stale. **Main limits:** Internet is required; notifications are in-app; there is no physical tracking. **Next steps:** College SSO, usability pilot, stronger booking concurrency, monitoring, backups, and shared live events across server instances.
