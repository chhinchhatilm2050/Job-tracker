import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Simple zero-dependency .env loader
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in .env");
  process.exit(1);
}

// Schemas & Models
const BoardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    columns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Column" }],
  },
  { timestamps: true }
);

const ColumnSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    boardId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: "Board" },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const JobApplicationSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    position: { type: String, required: true },
    location: { type: String },
    status: { type: String, required: true, default: "applied" },
    boardId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: "Board" },
    columnId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: "Column" },
    userId: { type: String, required: true, index: true },
    order: { type: Number, required: true, default: 0 },
    notes: { type: String },
    salary: { type: String },
    jobUrl: { type: String },
    appliedDate: { type: Date },
    tags: [{ type: String }],
    description: { type: String },
  },
  { timestamps: true }
);

const Board = mongoose.models.Board || mongoose.model("Board", BoardSchema);
const Column = mongoose.models.Column || mongoose.model("Column", ColumnSchema);
const JobApplication = mongoose.models.JobApplication || mongoose.model("JobApplication", JobApplicationSchema);

const TARGET_USER_ID = process.argv[2] || "6af68f71d74d6132c09d8143";

const DEFAULT_COLUMNS = [
  { name: "Wish List", order: 0 },
  { name: "Applied", order: 1 },
  { name: "Interviewing", order: 2 },
  { name: "Offer", order: 3 },
  { name: "Rejected", order: 4 },
];

const SAMPLE_JOBS = [
  {
    columnName: "Wish List",
    jobs: [
      {
        company: "Stripe",
        position: "Full Stack Engineer",
        location: "Remote",
        salary: "$160,000 - $190,000",
        jobUrl: "https://stripe.com/jobs",
        tags: ["React", "Node.js", "TypeScript"],
        description: "Building developer-first payment and financial infrastructure tools.",
        notes: "Recommended by a friend in developer advocacy.",
      },
      {
        company: "GitHub",
        position: "Senior Frontend Engineer",
        location: "Remote",
        salary: "$175,000 - $210,000",
        jobUrl: "https://github.com/careers",
        tags: ["Next.js", "TypeScript", "Accessibility"],
        description: "Help build the future of software collaboration.",
        notes: "Need to update portfolio with recent open source projects.",
      },
    ],
  },
  {
    columnName: "Applied",
    jobs: [
      {
        company: "Vercel",
        position: "Next.js Core Developer",
        location: "Remote",
        salary: "$180,000 - $220,000",
        jobUrl: "https://vercel.com/careers",
        tags: ["Next.js", "React 19", "Turbopack"],
        description: "Working on Next.js compiler, framework core, and DX improvements.",
        notes: "Applied via referral link on Nov 10.",
      },
      {
        company: "Linear",
        position: "Product Engineer",
        location: "Remote",
        salary: "$170,000 - $200,000",
        jobUrl: "https://linear.app/careers",
        tags: ["React", "TypeScript", "Tailwind CSS"],
        description: "Crafting delightful and blazing fast issue tracking software.",
        notes: "Included demo video in application.",
      },
    ],
  },
  {
    columnName: "Interviewing",
    jobs: [
      {
        company: "Supabase",
        position: "Fullstack Cloud Engineer",
        location: "Remote",
        salary: "$165,000 - $195,000",
        jobUrl: "https://supabase.com/careers",
        tags: ["PostgreSQL", "Next.js", "Go"],
        description: "Building open source backend services and developer dashboard.",
        notes: "Technical round scheduled for next Tuesday. Review Postgres internals.",
      },
    ],
  },
  {
    columnName: "Offer",
    jobs: [
      {
        company: "Airbnb",
        position: "Frontend Platform Engineer",
        location: "San Francisco, CA (Hybrid)",
        salary: "$210,000 - $250,000",
        jobUrl: "https://airbnb.com/careers",
        tags: ["Design Systems", "React", "Performance"],
        description: "Leading frontend architecture and company-wide design system.",
        notes: "Offer received! Need to counter on equity before Friday.",
      },
    ],
  },
  {
    columnName: "Rejected",
    jobs: [
      {
        company: "Google",
        position: "Software Engineer III",
        location: "Mountain View, CA",
        salary: "$185,000",
        jobUrl: "https://google.com/about/careers",
        tags: ["Angular", "TypeScript", "Distributed Systems"],
        description: "Internal tools engineering for Google Cloud Platform.",
        notes: "Position put on hold for Q4. Recruiter said to reapply next quarter.",
      },
    ],
  },
];

async function seed() {
  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(MONGODB_URI as string);
  console.log(`Connected! Seeding board for userId: ${TARGET_USER_ID}`);

  // Check if board already exists for user
  let board = await Board.findOne({ userId: TARGET_USER_ID, name: "Job Hunt" });

  if (board) {
    console.log(`Board "Job Hunt" already exists for user (${board._id}). Cleaning up old columns & jobs...`);
    await JobApplication.deleteMany({ boardId: board._id });
    await Column.deleteMany({ boardId: board._id });
  } else {
    console.log(`Creating new "Job Hunt" board...`);
    board = await Board.create({
      name: "Job Hunt",
      userId: TARGET_USER_ID,
      columns: [],
    });
  }

  // Create columns
  const createdColumns: Record<string, mongoose.Types.ObjectId> = {};
  const columnIds: mongoose.Types.ObjectId[] = [];

  for (const colDef of DEFAULT_COLUMNS) {
    const colDoc = await Column.create({
      name: colDef.name,
      order: colDef.order,
      boardId: board._id,
    });
    createdColumns[colDef.name] = colDoc;
    columnIds.push(colDoc._id as mongoose.Types.ObjectId);
    console.log(`Created Column: ${colDef.name} (${colDoc._id})`);
  }

  // Update board with columns
  board.columns = columnIds;
  await board.save();

  // Create sample applications
  let totalJobs = 0;
  for (const group of SAMPLE_JOBS) {
    const columnDoc = createdColumns[group.columnName];
    if (!columnDoc) continue;

    for (let i = 0; i < group.jobs.length; i++) {
      const jobData = group.jobs[i];
      await JobApplication.create({
        ...jobData,
        columnId: columnDoc._id,
        boardId: board._id,
        userId: TARGET_USER_ID,
        order: i,
        status: "applied",
        appliedDate: new Date(),
      });
      totalJobs++;
    }
  }

  console.log(`✅ Success! Seeded 1 Board, ${columnIds.length} Columns, and ${totalJobs} Job Applications for user: ${TARGET_USER_ID}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed script failed:", err);
  process.exit(1);
});
