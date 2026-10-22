# Find my professor · VNR VJIET

A working campus demo with a React/TypeScript mobile-responsive web app, Express API, PostgreSQL persistence and role-based cookie sessions. Violet-and-gold visual design.

## Start the demo

From this directory, run:

```powershell
npm install
npm run demo
```

The demo runner starts an isolated PostgreSQL instance on port 55432, applies migrations, adds 20 fictional faculty across five departments, starts the API on 4100, and starts Vite on 5173 (or its next available port). Read the URL printed by Vite. It does not edit private environment files or delete existing data. Persistent data lives in .demo-pgdata; subsequent starts preserve status, schedules and meetings. Node 20.11+ is required. Stop the demo with Ctrl+C.

## Show it in five minutes

1. Open the homepage and directory. Filter by department or current availability.
2. Open **Campus QR collection** from the sidebar or homepage. Every professor has a stored, stable QR identity. Scan a QR using a phone camera, or use **Scan QR → Demo QRs** / upload a QR photo.
3. Choose **Dr. Ananya Reddy** in the account menu. Publish a status such as In Class, a return time and a public note. Keep her QR profile open on a second device; it refreshes immediately through server-sent events, with five-second polling as a fallback.
4. Edit a weekly slot and select **Publish office hours**. The profile shows the schedule and the next posted office-hours window. Overlaps and invalid times are rejected.
5. Switch to **Student Patel**, find Ananya, bookmark her and request a future consultation. Switch back to Ananya to accept or decline. The student gets an in-app notification and sees the new state under My campus. Try an overlapping accepted meeting to demonstrate conflict handling.
6. Print a professor door sign or the entire QR collection.

Use separate browsers/devices for simultaneous student and professor sessions. Tabs in the same browser share their session cookie. The quick role menu is for this demo, not a production identity system.

## Accounts

All demo passwords: **DemoPass123!**

| Role | Email |
| --- | --- |
| Student | student@vnr.demo |
| Professor | ananya.reddy@vnr.demo |
| Second professor | vikram.rao@vnr.demo |
| Administrator | admin@vnr.demo |

Every sample professor can sign in with firstname.lastname@vnr.demo and the demo password. Names, faculty assignments and room numbers are fictional; this is a student demonstration, not an official college service.

## Phone access

Connect phone and computer to the same Wi-Fi. Open the **Network** URL printed by Vite, for example http://192.168.29.62:5173. Use this address on the desktop too before displaying/printing QR signs. The address may change with Wi-Fi. Allow the Node server through your firewall if Windows prompts. Guest Wi-Fi with client isolation may prevent access.

Browser camera access requires HTTPS or localhost. A phone opening a plain HTTP LAN address can use its native Camera app to scan a QR and open the app, upload a QR photo in the scanner, or use Demo QRs. In-app live camera scanning works on localhost and HTTPS; an HTTPS deployment is needed for the full mobile-camera experience. Physical phone camera access has not been tested on your device.

## Checks

- npm run build — shared/backend/frontend TypeScript checks and production frontend build.
- npm test — status, office-hour validation and foundation API tests. Requires local loopback networking for HTTP tests.
- npm run demo:verify — run while the demo is running; exercises all 20 QR identities, status propagation, roles, slot persistence/validation, booking approval, notifications, conflicts and cancellation. Restores status and office hours; leaves one cancelled verification meeting and audit/notification records.
- npm run test:legacy -w @wimp/backend — original checkpoint integration suite; requires the original destructive legacy seed in a separate disposable database. Do not run db:seed or db:reset against the demo or real campus data.

## Data pipeline

PostgreSQL stores Users, Professors, Departments, Offices, QrCodes (stable token + professor relationship), ProfessorStatus, OfficeHours, MeetingRequests, Events, Favorites, Notifications and AuditLogs. QR PNGs are rendered from stored tokens; changes to status never require replacing the QR. Scan → public QR API → faculty profile/status/hours. Faculty authenticated writes → database transaction → server-sent change event → client refetch (polling fallback). Meeting creation/response writes events and notifications transactionally.

Office hours are recurring IST windows for planning. Consultation requests can propose times outside these windows and require faculty approval. Expected return is an estimate; expired status is marked stale and never automatically proves someone is available. Manual status is not overwritten by the old timetable simulation worker.

## Deployment boundary

This is a functional local demonstration, not a production certification. Before a college launch: provision managed PostgreSQL and backups, deploy frontend/API behind one HTTPS origin with /api proxying, replace demo accounts/role switching with college SSO, enforce secure cookies and approved origins, add authentication throttling and monitoring, and perform a security/accessibility/load review. Use a database-level exclusion constraint or serializable retry for concurrent booking acceptance before production scale. No email, push notifications, GPS, or native Android/iOS package is claimed.

