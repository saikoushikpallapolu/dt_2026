# Find My Professor
## Project overview
A mobile-friendly web application that helps students check faculty availability before visiting. Teachers publish their status and consultation hours, and students see the updates automatically.

**App link:** https://dt-2026.onrender.com

## Main features
- **Students:** Search faculty, scan QR codes, view availability, and request consultations.
- **Teachers:** Update status, publish office hours, and accept or decline requests.
- **Administrators:** Manage faculty, departments, offices, and QR codes.
- **Improved build:** Teachers edit class timetables displayed to students.

## Technology stack
| Layer | Technology | Role |
| Frontend | React and TypeScript | Interactive user interface |
| Design and build | Tailwind CSS and Vite | Mobile layout and app build |
| Navigation and data | React Router and React Query | Pages, fetching, and refresh |
| Backend | Node.js and Express | APIs and application logic |
| Database | PostgreSQL and Prisma | Store and retrieve records |
| Authentication | bcryptjs and cookie sessions | Password hashing and login |
| Validation | Zod | Check submitted data |
| Live updates | Server Sent Events and polling | Synchronize student screens |
| QR codes | qrcode and html5-qrcode | Generate and scan profile links |
| Hosting | Render | Public HTTPS access |

## Architecture
Browser interface → Express API → Prisma → PostgreSQL.
After a teacher saves a change, the server signals connected browsers to fetch the updated information.
---PAGE---
# Workflow and demo
## How it works
1. **Find faculty:** A student searches the directory or scans a professor's QR code to open their profile.
2. **Publish status:** The teacher selects Available, In Class, In Meeting, Away, or On Leave, with an optional note and return time.
3. **Update students:** The server validates and saves the change. Live events and polling refresh student screens without a manual reload.
4. **Edit hours:** The teacher publishes recurring consultation slots. Students see the revised days, times, and notes.
5. **Request a meeting:** The student proposes a future time. The request appears as Pending for the teacher.
6. **Approve or decline:** The teacher responds. The student sees the updated request and an in-app notification.

## Main demonstration
- Open the teacher dashboard on a laptop and the student profile on a separate phone or browser session.
- Publish In Class with a short note; show it appearing on the student's screen.
- Change an office-hour slot; show the updated time and reload once to prove persistence.
- Submit a student meeting request, accept it as the teacher, and show the result.

## Demo login
**Teacher:** ananya.reddy@vnr.demo
**Student:** student@vnr.demo
**Password for both:** DemoPass123!

## Remember before presenting
Availability is teacher-reported, not GPS tracking. A timetable is a plan and does not automatically change live status. New timetable improvements were verified locally; confirm deployment before demonstrating them online.

## Short project explanation
'Find My Professor helps students check availability before visiting faculty. Teachers update their status and schedules, which are saved in a database and reflected on student screens. Students can also request consultations for teachers to approve.'
