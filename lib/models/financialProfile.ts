import mongoose, { Document, Schema } from "mongoose";

export interface IFinancialProfile extends Document {
  userId: string;
  monthlyIncome: number;
  monthlySavingsGoal: number;
  currencySymbol: string;
  noSpendStreak: number;
  lastNoSpendDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialProfileSchema = new Schema<IFinancialProfile>(
  {
    userId: { type: String, required: true, unique: true },
    monthlyIncome: { type: Number, min: 0, default: 0 },
    monthlySavingsGoal: { type: Number, min: 0, default: 0 },
    currencySymbol: { type: String, default: "$" },
    noSpendStreak: { type: Number, min: 0, default: 0 },
    lastNoSpendDate: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.models.FinancialProfile ||
  mongoose.model<IFinancialProfile>("FinancialProfile", FinancialProfileSchema);
