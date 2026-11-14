# Chhat — Job Application Tracker

Chhat helps job seekers keep their applications organized from the first saved role to the final offer. Track opportunities on visual Kanban boards, save important job details, and move applications through your own workflow.

## Features

- **Personal accounts:** Sign up and sign in with email and password. A default “Job Hunt” board is created for new users.
- **Multiple boards:** Create, switch between, and delete boards for different job searches. Add custom workflow columns when creating a board.
- **Kanban workflow:** Track applications through stages such as Wish List, Applied, Interviewing, Offer, and Rejected.
- **Drag-and-drop:** Move job cards between workflow stages, or use the card menu to choose a destination.
- **Application details:** Save the company, position, location, salary, job link, tags, description, and notes for each opportunity.
- **Application management:** Add, edit, and delete job applications. Confirmation dialogs help prevent accidental deletions.
- **Theme options:** Start in dark mode and switch between dark and light themes.
- **Responsive interface:** Use the dashboard and product pages on desktop or smaller screens.

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
