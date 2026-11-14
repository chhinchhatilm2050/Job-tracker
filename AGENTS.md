<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- Task That you need to do -->

Phase 1: Upgrade Your Database & Cards (Foundation)
Before building new screens, update your database schema so a single card can work for both a job application and a normal daily task.

Add boardType to your Board model: Allow boards to be tagged as job_tracker, general_tasks, or habits.

Expand your Card model: Add these fields to every card:

dueDate (Date/Timestamp — optional)

isMyDay (Boolean — defaults to false, lets users pin any card to their daily list)

priority (String — low, medium, high)

subtasks (Array of objects: { id, title, isCompleted })

jobDetails (Optional object: { company, salary, jobUrl } — only shown when boardType === 'job_tracker')

Build the Card Detail Modal: Make clicking any card open a popup where users can edit these new fields, add subtasks, and pick a due date.

Phase 2: Multi-Board Templates (Beyond Job Tracking)
Make your existing Board Switcher (Job Hunt v) and + New Board button support different workflows.

Create a "New Board" Template Modal: When a user clicks + New Board, let them choose a starting template:

Job Hunt: Columns Wish List, Applied, Interviewing, Offer

Daily To-Do: Columns To Do, Doing, Done

Blank Board: Lets the user name their own columns and pick colors

Update Board Card UI: Show small badges on the front of each card when data exists (e.g., a calendar icon for dueDate, a checklist counter like 2/4 for subtasks, or a company name badge for job cards).

Phase 3: Build the "My Day" Unified Dashboard
This is the core feature that helps users manage what they need to do every day across all boards.

Add Top Navigation Tabs: Add a simple switcher at the top of your app: ☀️ My Day | 📋 Boards.

Create the "My Day" Query: Fetch all incomplete cards across all of the user's boards where:

isMyDay === true, OR

dueDate is today or overdue.

Add a Quick-Add Input Bar: At the top of My Day, put a single input box ("Add a task for today...") that creates a card directly in a default "Daily Tasks" board with isMyDay: true.

Add "Add to My Day" Toggle: Inside the Card Detail Modal, add a button so users can manually send any job application or project task to their daily view.

Phase 4: Daily Habits & Automation (Polish)
Once your core features work smoothly, add small daily automations to keep users coming back.

Recurring Daily Tasks: Add a repeatDaily boolean to cards. When checked off, automatically reset it to incomplete at midnight and increment a streak counter.

Morning Carry-Over Prompt: When a user opens My Day on a new date, show unfinished tasks from yesterday with two quick buttons: "Keep for Today" or "Remove from Today".
