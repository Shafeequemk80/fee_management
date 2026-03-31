import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  admissionNumber: string;
  name: string;
  classId: mongoose.Types.ObjectId;
  parentName: string;
  phone: string; // WhatsApp number
  customMonthlyFee?: number; // Override for class default fee
  status: "active" | "inactive";
}

const StudentSchema = new Schema<IStudent>(
  {
    admissionNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    classId: { type: Schema.Types.ObjectId, ref: "ClassStructure", required: true },
    parentName: { type: String, required: true },
    phone: { type: String, required: true },
    customMonthlyFee: { type: Number },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);
