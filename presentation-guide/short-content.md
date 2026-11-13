# Find My Professor Project Brief
## Project overview
Find My Professor is a mobile-responsive web app that helps students check faculty availability, view schedules, and request consultations. Teachers publish their status and office hours; students see updates without manually refreshing.

**Problem solved:** Students may visit a cabin without knowing whether the professor is available. A QR-linked profile and searchable directory help them check before visiting.

**App:** https://dt-2026.onrender.com

## Main features
- **Students:** Search faculty, scan QR codes, view status and hours, bookmark professors, and request meetings.
- **Teachers:** Publish availability and notes, edit office hours, and accept or decline meeting requests.
- **Administrators:** Manage faculty, offices, departments, QR codes, and audit records.
- **Improved local build:** Editable class timetable that appears on student profiles.

## Technology stack
| Component | Technology | Purpose |
| Frontend | React and TypeScript | Interactive screens and typed code |
| Styling and build | Tailwind CSS and Vite | Responsive design and frontend build |
| Routing and data | React Router and React Query | Page navigation, fetching, and refresh |
| Backend | Node.js and Express | APIs and server-side business logic |
| Database | PostgreSQL and Prisma | Persistent records and transactions |
| Validation and login | Zod, bcryptjs, cookie sessions | Input checks, password hashing, and access control |
| Live updates | Server Sent Events and polling | Refresh student data after teacher changes |
| QR tools | qrcode and html5-qrcode | Generate and scan profile links |
| Hosting and testing | Render; Vitest and Playwright | Public access and automated verification |

## Architecture in one sentence
The React browser app calls the Express API, which validates the user and saves data in PostgreSQL through Prisma; live events then tell connected browsers to fetch the latest data.
---PAGE---
# Workflow and demonstration
## How the application works
1. **Find a professor.** The student searches the directory or scans a QR. The QR contains a stable profile link, while current information comes from the database.
2. **Publish availability.** The teacher selects Available, In Class, In Meeting, Away, or On Leave and can add a public note and return estimate.
3. **Save and synchronize.** The server checks login, role, and input, saves the status with history and an audit record, then sends a change event. Student screens fetch and display the new data. Polling provides a fallback.
4. **Update schedules.** The teacher edits and publishes recurring office hours or the improved class timetable. Students see revised days, times, and notes. Invalid times and overlaps within each schedule are rejected.
5. **Request a consultation.** The student proposes a future date and time. The request becomes Pending in the teacher's queue.
6. **Respond and notify.** The teacher accepts or declines. The student sees the new state and an in-app notification. Overlaps with accepted meetings are checked.

## The main demo in four steps
- Keep the teacher dashboard open on a laptop and the student profile open on a separate phone or browser session.
- Publish In Class with a distinctive note. Show the student's screen changing without a reload.
- Edit and publish an office-hour slot. Show the revised slot, then reload once to prove persistence.
- Request a future meeting as the student, accept it as the teacher, and show the student's updated request and notification.

**Demo accounts:** Teacher: ananya.reddy@vnr.demo | Student: student@vnr.demo
**Password for both:** DemoPass123!

## Important points for judges
- Availability is **self-reported**, not GPS or sensor tracking. Expired status is marked stale.
- Class timetables, office hours, and individual meeting requests are separate concepts. Timetable edits do not automatically change live status.
- The new class timetable and sync improvements were verified locally but were **not yet deployed** at the last check. Confirm the version before presenting.
- Notifications are inside the app. The prototype needs internet access; offline operation and large-scale capacity are not established.

## Short explanation to say aloud
'Our project helps students check faculty availability before visiting. Teachers control their status and schedules. Changes are stored in a database and reflected on student screens through live updates. Students can also request consultations, and teachers can approve them through a structured workflow.'
