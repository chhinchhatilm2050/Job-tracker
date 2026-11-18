# Life Flow

Life Flow helps you organize work across job searches, daily tasks, projects, and habits. Create Kanban boards, track details and deadlines, and bring your priorities together in My Day and Manage money flow for you spent every day and saving money in the feature.

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
- **Brain dump:** Press Ctrl+K or Cmd+K to capture a task, job application, or expense in plain language; dates, priority, estimated duration, amounts, and expense categories are parsed automatically.
- **Money Flow:** Log spending in one line, see how much you can safely spend today, auto-log recurring bills, spot categories where you are overspending, and build a no-spend streak. See [Money Flow](#money-flow).
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

## Money Flow

Money Flow is the finance side of the app. Open it from **Money Flow** in the top navigation (you need to be signed in). It replaces category budgets with one number: how much you can spend today and still hit your savings goal.

### What it does

- **Safe-to-Spend:** A card at the top shows your daily allowance, what you have spent today, and an **On pace** (green) or **Over pace** (red) badge. The allowance is:

  ```text
  Remaining pool = Monthly income - Fixed bills - Savings goal - Spending so far this month
  Safe to spend today = Remaining pool / Days left in the month (including today)
  ```

  Recurring bills count as fixed bills, so they are not included in "spending so far".
- **One-line expense logging:** Type an expense the way you would say it. The amount, date (`today` or `yesterday`), and category are filled in for you, and you can change the category before saving.
- **Recurring bills:** Add `monthly`, `/mo`, `yearly`, `/yr`, or `daily` to an expense to make it recurring. Each time you open Money Flow, bills that have come due are logged automatically and their next due date moves forward. A bill that starts on the 31st is charged on the last day of shorter months.
- **Renewal alerts:** A banner warns you when a bill renews within 3 days. Choose **Keep** to dismiss it or **Cancel** to stop the bill.
- **Spending leaks:** From the 15th of the month, Money Flow compares this month's spending by category with last month's and lists the 3 categories that grew the most. Before the last day it projects your current pace to a full month; on the last day it shows the final monthly wrap-up.
- **Cut-out challenges:** Choose **Cap at $X Next Month** on a leak to set a spending limit for that category next month. Each challenge shows a progress bar that turns yellow at 75% of the cap and red when you reach it.
- **Evening wrap-up and no-spend streak:** At 6:00 PM a wrap-up opens with today's total spend and tomorrow's Safe-to-Spend. You can also open it anytime with **Wrap Up Day**. If you spent nothing today, choose **Claim No-Spend Day** to grow your streak. Missing a day resets the streak.

### How to use Money Flow

1. **Set your budget.** Open Money Flow and choose **Set budget** (or the gear icon). Enter your monthly income, monthly savings goal, and currency symbol.
2. **Log what you spend.** Type into the **Add expense** bar at the top of the page and choose **Add expense**. On this page you do not need `$` or "spent", because everything you type is treated as an expense.
3. **Log from anywhere.** Press Ctrl+K (Cmd+K on Mac). Start with `$` or the word `spent` so the quick bar knows it is an expense and not a task.
4. **Add recurring bills.** Log the first payment with a frequency word, such as `netflix $15 monthly`. It then appears under **Recurring bills**, where you can cancel it.
5. **Check your pace.** Keep today's spend at or below Safe-to-Spend to stay green.
6. **Act on leaks.** After the 15th, review the leak list and cap the categories you want to cut next month.
7. **Close the day.** Review the evening wrap-up and claim no-spend days to build your streak.

### Expense examples

| You type | Result |
| --- | --- |
| `lunch 12` | $12.00, Food & Dining, today |
| `coffee $4.50` | $4.50, Food & Dining, today |
| `grab $5 yesterday` | $5.00, Transport, yesterday |
| `spent 20 on uber` | $20.00, Transport, today |
| `netflix $15 monthly` | $15.00, Subscriptions, repeats every month |
| `book 15` | $15.00, Other (pick a category before saving) |

Categories are matched from keywords:

| Category | Keywords |
| --- | --- |
| Food & Dining | lunch, coffee, dinner, burger, grocery, groceries, food |
| Transport | uber, grab, gas, fuel, train, bus, parking |
| Utilities | electric, electricity, water, internet, wifi, phone |
| Subscriptions | netflix, spotify, icloud, gym, subscription |
| Shopping | shopping, clothes, clothing, store |
| Entertainment | movie, cinema, concert, game |
| Health | doctor, medicine, pharmacy, health |

Anything else is saved as **Other** unless you choose a different category.

Days are tracked in UTC, so near midnight an expense may be counted on the previous or next day depending on your time zone.

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
