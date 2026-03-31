import mongoose, { Schema, Document } from "mongoose";

export interface IFee extends Document {
  studentId: mongoose.Types.ObjectId;
  month: number; // 1-12
  year: number; 
  amount: number;
  amountPaid: number;
  status: "paid" | "unpaid" | "partial";
  dueDate: Date;
}

const FeeSchema = new Schema<IFee>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    amount: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    status: { type: String, enum: ["paid", "unpaid", "partial"], default: "unpaid" },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

// Compound index to ensure one fee per student per month
FeeSchema.index({ studentId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.models.Fee || mongoose.model<IFee>("Fee", FeeSchema);
