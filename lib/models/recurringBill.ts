import { randomUUID } from "node:crypto";
import mongoose, { Document, Schema } from "mongoose";
import {
  TRANSACTION_CATEGORIES,
  type RecurringFrequency,
  type TransactionCategory,
} from "../moneyFlowTypes";

export type { RecurringFrequency };

export interface IRecurringBill extends Document<string> {
  userId: string;
  title: string;
  amount: number;
  category: TransactionCategory;
  frequency: RecurringFrequency;
  nextDueDate: Date;
  billingDay?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringBillSchema = new Schema(
  {
    _id: { type: String, default: randomUUID },
    userId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: TRANSACTION_CATEGORIES,
      default: "Other",
    },
    frequency: {
      type: String,
      enum: ["daily", "monthly", "yearly"],
      required: true,
    },
    nextDueDate: { type: Date, required: true },
    billingDay: { type: Number, min: 1, max: 31 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

RecurringBillSchema.index({ userId: 1, isActive: 1, nextDueDate: 1 });

export default mongoose.models.RecurringBill ||
  mongoose.model<IRecurringBill>("RecurringBill", RecurringBillSchema);
