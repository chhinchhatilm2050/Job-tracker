import mongoose, { Schema, Document} from "mongoose";
import { randomUUID } from "node:crypto";
import type { TaskEffort } from "./models.types";

const SubtaskSchema = new Schema(
    {
        id: {
            type: String,
            default: randomUUID,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false },
);

const JobDetailsSchema = new Schema(
    {
        company: { type: String, trim: true },
        salary: { type: String, trim: true },
        jobUrl: { type: String, trim: true },
    },
    { _id: false },
);

export interface IJobApplication extends Document {
    title: string;
    company: string,
    position: string,
    location: string,
    status: string,
    columnId: mongoose.Types.ObjectId,
    boardId: mongoose.Types.ObjectId,
    userId: string,
    order: number,
    notes?: string,
    salary?: string,
    jobUrl?: string,
    appliedDate?: string,
    tags?: string[],
    description?: string;
    dueDate?: Date;
    estimatedDurationMinutes?: number;
    effort?: TaskEffort;
    actualDurationMinutes: number;
    isMyDay: boolean;
    myDayDate?: Date;
    myDayDismissedDate?: Date;
    priority: "low" | "medium" | "high";
    subtasks: Array<{ id: string; title: string; isCompleted: boolean }>;
    jobDetails?: { company?: string; salary?: string; jobUrl?: string };
    isCompleted: boolean;
    repeatDaily: boolean;
    streakCount: number;
    completedAt?: Date;
    lastCompletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
};

const JobApplicationSchema = new Schema<IJobApplication>({
    title: {
        type: String,
        trim: true,
        default: "",
    },
    company: {
        type: String,
        default: "",
    },
    position: {
        type: String,
        default: "",
    },
    location: {
        type: String,
    },
    status: {
        type: String,
        required: true,
        default: "applied"
    },
    boardId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
        ref: "Board"
    },
    columnId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
        ref: "Column"
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    order: {
        type: Number,
        required: true,
        default: 0
    },
    notes: {
        type: String,
    },
    salary: {
        type: String,
    },
    jobUrl: {
        type: String,
    },
    appliedDate: {
        type: Date,
    },
    tags: [
        {
            type: String,
        },
    ],
    description: {
        type: String,
    },
    dueDate: {
        type: Date,
    },
    estimatedDurationMinutes: {
        type: Number,
        min: 5,
        max: 480,
    },
    effort: {
        type: String,
        enum: ["light", "moderate", "heavy"],
    },
    actualDurationMinutes: {
        type: Number,
        min: 0,
        default: 0,
    },
    isMyDay: {
        type: Boolean,
        default: false,
    },
    myDayDate: {
        type: Date,
    },
    myDayDismissedDate: {
        type: Date,
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
    },
    subtasks: {
        type: [SubtaskSchema],
        default: [],
    },
    jobDetails: {
        type: JobDetailsSchema,
        default: undefined,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    repeatDaily: {
        type: Boolean,
        default: false,
    },
    streakCount: {
        type: Number,
        min: 0,
        default: 0,
    },
    completedAt: {
        type: Date,
    },
    lastCompletedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

export default mongoose.models.JobApplication || mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);