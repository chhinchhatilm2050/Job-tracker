# Task Flow

Task Flow helps you organize work across job searches, daily tasks, projects, and habits. Create Kanban boards, track details and deadlines, and bring your priorities together in My Day.

## Features

- **Personal accounts:** Sign up and sign in with email and password or Google. A default “Job Hunt” board is created for new users.
- **Multiple workflows:** Create boards from Job Hunt and Daily To-Do templates, or customize a blank board with your own columns and colors. Boards can also be used for habits.
- **Kanban workflow:** Track applications through stages such as Wish List, Applied, Interviewing, Offer, and Rejected.
- **Drag-and-drop:** Move job cards between workflow stages, or use the card menu to choose a destination.
- **Card details:** Edit job or task details, due dates, priorities, subtasks, recurring settings, and whether a card belongs on My Day.
- **My Day:** See incomplete cards pinned from any board or due today/overdue, add quick tasks, and decide whether to keep or remove unfinished carry-over tasks.
- **Daily habits:** Mark recurring tasks complete to track streaks; recurring cards reset when My Day is revisited or remains open through midnight.
- **Smart daily planning:** Set available hours and energy, then automatically time-block tasks by priority, effort, and interview timing, with overload warnings and rescheduling.
- **Focus mode:** Work through 25-minute Pomodoro sessions and log completed or partial focus time against a card.
- **Brain dump:** Press Ctrl+K or Cmd+K to capture a task or job application in plain language; dates, priority, and estimated duration are parsed automatically.
- **Daily wrap-up:** Review completed tasks, focus time, and applications, then move unfinished tasks to tomorrow.
- **Card management:** Add, edit, move, complete, and delete cards. Confirmation dialogs help prevent accidental deletions.
- **Theme options:** Start in dark mode and switch between dark and light themes.
- **Responsive interface:** Use the dashboard and product pages on desktop or smaller screens.

## How to use Task Flow

1. **Choose a board.** Open Boards and create a Job Hunt or Daily To-Do board, or choose a blank board for a custom workflow.
2. **Add cards.** Create an application or task, then open its card to set details such as priority, due date, subtasks, and estimated duration.
3. **Capture work quickly.** Use Quick capture in the top navigation or press Ctrl+K (Cmd+K on Mac). For example: `Buy groceries today high priority 30m`.
4. **Plan My Day.** Pin cards to My Day or let due-today and overdue cards appear automatically. Choose your start time, energy level, and available hours, then choose **Auto-Plan My Day**.
5. **Focus and finish.** Choose Focus on a scheduled card to start a 25-minute work session followed by a 5-minute break. Mark cards complete as you work.
6. **Wrap up.** Review your daily progress and move unfinished work to tomorrow when you are ready.

## Technology

- Next.js 16 App Router and React 19
- TypeScript
- Tailwind CSS 4
- MongoDB with Mongoose
- Better Auth for email/password authentication
- dnd-kit for drag-and-drop interactions
- Base UI and Lucide icons

## Getting Started

### Requirements

- Node.js and npm
- A MongoDB database

### Configure the database

Create a local `.env` file and set the MongoDB connection string:

```env
MONGODB_URI=<your-mongodb-connection-string>
```

Keep real credentials private; do not commit `.env` files.

### Configure Google sign-in

Create a Google OAuth client ID and secret, then add them to `.env`:

```env
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>
```

Set the authorized redirect URI in Google Cloud to
`<your-BETTER_AUTH_URL>/api/auth/callback/google` (for local development,
`http://localhost:3000/api/auth/callback/google`). Keep the OAuth secret private.

### Run the app

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To create and run a production build:

```bash
npm run build
npm start
```
