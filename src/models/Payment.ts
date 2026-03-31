import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  feeId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  method: "cash" | "bank_transfer" | "other";
  receiptNumber: string;
}

const PaymentSchema = new Schema<IPayment>(
  {
    feeId: { type: Schema.Types.ObjectId, ref: "Fee", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: { type: String, enum: ["cash", "bank_transfer", "other"], default: "cash" },
    receiptNumber: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
