import mongoose, { Schema, Document} from "mongoose";
export interface IBoard extends Document {
    name: string;
    userId: string;
    boardType: "job_tracker" | "general_tasks" | "habits";
    columns: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
};

const BoardSchema = new Schema<IBoard>({
    name: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    boardType: {
        type: String,
        enum: ["job_tracker", "general_tasks", "habits"],
        default: "job_tracker",
        required: true,
    },
    columns: [
        {
            type: Schema.Types.ObjectId,
            ref: "Column"
        },
    ],
}, {
    timestamps: true,
});

export default mongoose.models.Board || mongoose.model<IBoard>("Board", BoardSchema);