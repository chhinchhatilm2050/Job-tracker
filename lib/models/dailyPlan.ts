import mongoose, { Document, Schema } from "mongoose";

export interface IDailyPlan extends Document {
  userId: string;
  date: Date;
  availableHours: number;
  startMinute: number;
  energyLevel?: "high" | "normal" | "low";
  schedule: Array<{
    cardId: mongoose.Types.ObjectId;
    startMinute: number;
    durationMinutes: number;
  }>;
  focusEntries: Array<{
    cardId: mongoose.Types.ObjectId;
    title: string;
    minutes: number;
    loggedAt: Date;
  }>;
}

const DailyPlanSchema = new Schema<IDailyPlan>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    availableHours: { type: Number, min: 1, max: 9, default: 6 },
    startMinute: { type: Number, min: 0, max: 1439, default: 9 * 60 },
    energyLevel: {
      type: String,
      enum: ["high", "normal", "low"],
    },
    schedule: {
      type: [
        new Schema(
          {
            cardId: {
              type: Schema.Types.ObjectId,
              required: true,
              ref: "JobApplication",
            },
            startMinute: { type: Number, min: 0, max: 1439, required: true },
            durationMinutes: { type: Number, min: 1, max: 480, required: true },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    focusEntries: {
      type: [
        new Schema(
          {
            cardId: {
              type: Schema.Types.ObjectId,
              required: true,
              ref: "JobApplication",
            },
            title: { type: String, required: true },
            minutes: { type: Number, min: 1, max: 25, required: true },
            loggedAt: { type: Date, required: true },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
  },
  { timestamps: true },
);

DailyPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyPlanModel: mongoose.Model<IDailyPlan> =
  mongoose.models.DailyPlan ||
  mongoose.model<IDailyPlan>("DailyPlan", DailyPlanSchema);

export default DailyPlanModel;
