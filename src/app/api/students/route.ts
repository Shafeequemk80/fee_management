import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

const studentSchema = z.object({
  admissionNumber: z.string().min(1, "Admission number is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  dob: z.string().min(1, "Date of birth is required"),
  classId: z.string().min(1, "Class is required"),
  parentName: z.string().min(2, "Parent name is required"),
  phone: z.string().min(10, "Valid WhatsApp number is required"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const search = searchParams.get("search");

    const query: any = {};
    if (classId) query.classId = classId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { admissionNumber: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    await dbConnect();
    const students = await Student.find(query)
      .populate("classId", "name")
      .sort({ admissionNumber: 1 });

    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const validatedData = studentSchema.parse(body);

    const existingStudent = await Student.findOne({ admissionNumber: validatedData.admissionNumber });
    if (existingStudent) {
      return NextResponse.json({ error: "Admission number must be unique" }, { status: 400 });
    }

    const newStudent = await Student.create(validatedData);

    // Format YYYY-MM-DD to DD-MM-YYYY for password
    const [year, month, day] = validatedData.dob.split('-');
    const defaultPassword = `${day}-${month}-${year}`;
    console.log(defaultPassword);
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await User.create({
      username: validatedData.admissionNumber,
      password: hashedPassword,
      role: "student",
      studentId: newStudent._id,
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await dbConnect();
    const body = await req.json();
    const validatedData = studentSchema.partial().parse(body); // Partial for updates

    const updatedStudent = await Student.findByIdAndUpdate(id, validatedData, { new: true });

    return NextResponse.json(updatedStudent);
  } catch (error:any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.cause }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await dbConnect();
    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    await Student.findByIdAndDelete(id);
    // Delete associated user
    await User.findOneAndDelete({ studentId: id });

    return NextResponse.json({ message: "Student deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
