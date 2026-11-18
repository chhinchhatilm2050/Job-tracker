import { randomUUID } from "node:crypto";
import mongoose, { Document, Schema } from "mongoose";
import {
  TRANSACTION_CATEGORIES,
  type TransactionCategory,
} from "../moneyFlowTypes";

export type CutoutChallengeStatus = "active" | "completed" | "failed";

export interface ICutoutChallenge extends Document<string> {
  userId: string;
  category: TransactionCategory;
  targetCapAmount: number;
  monthYear: string;
  status: CutoutChallengeStatus;
  createdAt: Date;
  updatedAt: Date;
}

const CutoutChallengeSchema = new Schema(
  {
    _id: { type: String, default: randomUUID },
    userId: { type: String, required: true },
    category: {
      type: String,
      enum: TRANSACTION_CATEGORIES,
      required: true,
    },
    targetCapAmount: { type: Number, required: true, min: 0 },
    monthYear: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },
    status: {
      type: String,
      enum: ["active", "completed", "failed"],
      default: "active",
    },
  },
  { timestamps: true },
);

CutoutChallengeSchema.index(
  { userId: 1, category: 1, monthYear: 1 },
  { unique: true },
);

export default mongoose.models.CutoutChallenge ||
  mongoose.model<ICutoutChallenge>("CutoutChallenge", CutoutChallengeSchema);
