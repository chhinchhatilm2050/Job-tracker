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

<!-- you need to update -->

The previous plan felt too manual—it still forces users to manage checkboxes, due dates, and boards themselves. To make your project much smarter, more unique, and truly modern (like Motion, Sunsama, or Notion AI), replace manual task lists with an Automated Daily Command Center that actively thinks and plans for the user.

1. Auto-Scheduled Daily Timeline (Time-Blocking Engine)
Instead of giving users a static list of tasks that piles up, build a Smart Time-Blocker that automatically places their daily tasks into an hourly schedule. Let users choose their start time and available working hours (defaulting to a 9:00 AM start):

How it works: Users set when their workday starts, their available working hours (e.g., 4 hours/day), and each task's estimated duration (15m, 30m, 1h, 2h). Keep the planned window within the same day.

Smart Auto-Fill: With one click ("Auto-Plan My Day"), your app automatically fills open time slots on their daily timeline—putting high-priority tasks and job interviews first, and slotting quick tasks into leftover 15-minute gaps.

Overload Warning: If a user tries to add 9 hours of tasks into a 6-hour day, show a live warning ("You're overbooked by 3 hours—move 2 tasks to tomorrow?").

2. Focus Mode + Built-In Pomodoro & Ambient Timer
Users don't just need to track tasks; they need help actually finishing them without getting distracted.

Single-Task Focus View: Clicking "Start Focus" hides the entire Kanban board and shows only one active task on a clean dark screen with a countdown timer (25:00 work / 5:00 break).

Automatic Time Tracking: When the timer finishes, automatically log the real time spent on that card (e.g., Estimated: 1h | Actual: 1h 15m) so users learn how long tasks actually take them.

3. Smart "Brain Dump" Inbox (Zero-Friction Capture)
Most people abandon task trackers because filling out forms (title, board, column, priority, due date) takes too long.

One-Line Natural Language Input: Let users type a messy thought into a global quick-bar (Cmd + K or Ctrl + K), like:

"Apply to Google frontend role tomorrow high priority 1h"

"Buy groceries and pay internet bill today 30m"

Auto-Parsing: Your code automatically extracts the date (tomorrow), priority (high), duration (1h), and routes it to the right board without the user touching a single dropdown.

4. Daily Energy & Mood Check-In (Adaptive Recommendations)
Standard trackers treat every day the same, even when the user is exhausted.

Morning Energy Picker: When opening the app each morning, ask one quick question: "How is your energy today?" (⚡ High, 🔋 Normal, 🪫 Low).

Dynamic Task Filtering:

On High Energy days, push deep work (coding projects, interview prep, cover letters) to the top.

On Low Energy days, hide heavy tasks and recommend easy "quick wins" (organizing files, browsing job boards, short errands) so the user still makes progress without burning out.

5. End-of-Day "Daily Wrap-Up" Ritual
Give users a 60-second evening review screen at 6:00 PM (or whenever they finish work):

Shows a visual summary of what they accomplished today (tasks completed, hours focused, job applications sent).

Automatically reschedules unfinished tasks into tomorrow's timeline with one click so they close their laptop with zero stress.