import { randomUUID } from "node:crypto";
import mongoose, { Document, Schema } from "mongoose";
import {
  TRANSACTION_CATEGORIES,
  type TransactionCategory,
} from "../moneyFlowTypes";

export { TRANSACTION_CATEGORIES };
export type { TransactionCategory };

export interface ITransaction extends Document<string> {
  userId: string;
  rawInput: string;
  title: string;
  amount: number;
  category: TransactionCategory;
  date: Date;
  isRecurring: boolean;
  recurringId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema(
  {
    _id: { type: String, default: randomUUID },
    userId: { type: String, required: true },
    rawInput: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: TRANSACTION_CATEGORIES,
      default: "Other",
    },
    date: { type: Date, required: true, default: Date.now },
    isRecurring: { type: Boolean, default: false },
    recurringId: { type: String, ref: "RecurringBill" },
  },
  { timestamps: true },
);

TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ recurringId: 1, date: 1 });

export default mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
