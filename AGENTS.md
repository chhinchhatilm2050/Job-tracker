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

<!-- New Feature about cash flow-->

Project Spec: "Money Flow" — Smart Financial Command Center1. System Overview & Navigation ArchitectureModule Separation: Add a top-level navigation toggle or sidebar switch separating Tab 1: Focus Flow (Tasks) and Tab 2: Money Flow (Finance).Shared Global Utility: Extend the existing Cmd + K / Ctrl + K Quick-Bar to detect intent (Task vs. Expense) or allow switching modes via prefix (e.g., $ or spent).Design Philosophy: Zero manual dropdowns, automated recurring math, and proactive alerts instead of passive charts.2. Database Schema (Tables & Fields)Create these 4 core tables to power the module:JSON{
  "financial_profile": {
    "user_id": "string (PK)",
    "monthly_income": "number",
    "monthly_savings_goal": "number",
    "currency_symbol": "string (default: '$')",
    "no_spend_streak": "integer (default: 0)"
  },
  "transactions": {
    "id": "uuid (PK)",
    "user_id": "string (FK)",
    "raw_input": "string",
    "title": "string",
    "amount": "number",
    "category": "enum ['Food & Dining', 'Transport', 'Utilities', 'Subscriptions', 'Shopping', 'Entertainment', 'Health', 'Other']",
    "date": "date (YYYY-MM-DD)",
    "is_recurring": "boolean",
    "recurring_id": "uuid (nullable, FK)"
  },
  "recurring_bills": {
    "id": "uuid (PK)",
    "user_id": "string (FK)",
    "title": "string",
    "amount": "number",
    "category": "string",
    "frequency": "enum ['daily', 'monthly', 'yearly']",
    "next_due_date": "date",
    "is_active": "boolean"
  },
  "cutout_challenges": {
    "id": "uuid (PK)",
    "user_id": "string (FK)",
    "category": "string",
    "target_cap_amount": "number",
    "month_year": "string (YYYY-MM)",
    "status": "enum ['active', 'completed', 'failed']"
  }
}
3. Agent Implementation Tasks (Step-by-Step):

Task 1: Natural Language Quick-Log Parser (Cmd + K Extension)Goal: Parse raw strings into structured transaction objects without form inputs.Logic Requirements:Amount Extraction: Match currency regex (e.g., \$?\d+(\.\d{1,2})?).Frequency Detection: Detect keywords (monthly, /mo, every month, yearly, /yr, daily). If found, route to recurring_bills AND log today's instance if applicable.Date Detection: Parse today, yesterday, or default to current date.Keyword Auto-Categorizer: Map keywords to categories using a dictionary:lunch, coffee, dinner, burger, grocery, food $\rightarrow$ Food & Dininguber, grab, gas, fuel, train, bus, parking $\rightarrow$ Transportelectric, water, internet, wifi, phone $\rightarrow$ Utilitiesnetflix, spotify, icloud, gym, subscription $\rightarrow$ SubscriptionsFallback: Show a 1-click confirmation pill with editable tags before saving.

Task 2: Automated Recurring Engine & Silent Leak Detector
Goal: Automate fixed bills and warn users before renewals.

Logic Requirements:

Cron / On-Load Check: When the app loads, check recurring_bills where next_due_date <= today and is_active == true. Automatically insert a row into transactions and advance next_due_date by 1 day, 1 month, or 1 year.

3-Day Renewal Alert: Query recurring_bills where next_due_date is within today + 3 days. Display a dismissible banner: "Upcoming: [Title] ($[Amount]) renews in [X] days. Keep or Cancel?"


Task 3: "Safe-to-Spend" Daily Pulse EngineGoal: Replace static category budgets with one live daily allowance number.Math Formula:$$\text{Remaining Monthly Pool} = \text{Monthly Income} - \text{Total Monthly Fixed Bills} - \text{Monthly Savings Goal} - \text{Variable Spend So Far This Month}$$$$\text{Daily Safe-to-Spend} = \frac{\text{Remaining Monthly Pool}}{\text{Days Remaining in Month (including today)}}$$UI Component: Display a large hero card at the top of Money Flow showing Daily Safe-to-Spend, Today's Spend, and a dynamic pacing indicator (Green if Today's Spend <= Daily Safe-to-Spend, Red if over).


Task 4: Automated "Cut-Out" Advisor (Mid-Month & End-of-Month Audit)
Goal: Identify overspending categories and convert them into next-month spending caps.

Logic Requirements:

Comparison Query: Group transactions by category for Current Month vs. Previous Month (excluding fixed bills).

Trigger Condition: Trigger audit card on the 15th of the month (Mid-Month Pace Warning) and Last Day of the month (Monthly Wrap-Up).

Top-3 Leaks Calculation: Sort categories by highest percentage/dollar increase over last month. Display top 3 with a button: "Cap at $[Suggested_Limit] Next Month".

Challenge Tracker: Clicking the button inserts a record into cutout_challenges and renders a green/yellow/red progress bar on the dashboard for the following month.


Task 5: Financial Evening Wrap-Up Ritual (6:00 PM Check-In)
Goal: Provide a 10-second daily closing screen and gamify $0 spend days.

Logic Requirements:

Trigger: Show inside the 6:00 PM wrap-up modal (or via a "Wrap Up Day" button on the Money Flow tab).

Summary View: Display Today's Total Spend and Updated Tomorrow's Safe-to-Spend.

Zero-Spend Gamification: If Today's Total Spend == 0, highlight a "Claim No-Spend Day 🎉" button that increments financial_profile.no_spend_streak by +1 and displays a flame/streak badge.



4. Recommended Build Order for Your Agent
Prompt 1: "Set up the database tables (financial_profile, transactions, recurring_bills, cutout_challenges) and add the navigation toggle between Focus Flow and Money Flow."

Prompt 2: "Build the Natural Language Expense Parser and hook it into the Cmd+K quick bar."

Prompt 3: "Build the Safe-to-Spend Daily Pulse hero widget and the Recurring Bills auto-logger."

Prompt 4: "Build the Top-3 Spending Leaks Cut-Out Advisor and the Evening Wrap-Up No-Spend Streak modal."