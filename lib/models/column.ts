import mongoose, { Schema, Document} from "mongoose";
export interface IColumn extends Document {
    name: string;
    boardId: mongoose.Types.ObjectId;
    order: number;
    jobApplications: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
};

const ColumnSchema = new Schema<IColumn>({
    name: {
        type: String,
        required: true,
    },
    boardId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
        ref: "Board"
    },
    order: {
        type: Number,
        required: true,
        default: 0
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

ColumnSchema.virtual("jobApplications", {
    ref: "JobApplication",
    localField: "_id",
    foreignField: "columnId",
    options: { sort: { order: 1 } },
});

export default mongoose.models.Column || mongoose.model<IColumn>("Column", ColumnSchema);