import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  admissionNumber: string;
  name: string;
  dob: string;
  classId: mongoose.Types.ObjectId;
  parentName: string;
  phone: string; // WhatsApp number
  status: "active" | "inactive";
}

const StudentSchema = new Schema<IStudent>(
  {
    admissionNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    dob: { type: String, required: true },
    classId: { type: Schema.Types.ObjectId, ref: "ClassStructure", required: true },
    parentName: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);
