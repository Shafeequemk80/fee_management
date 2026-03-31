import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const students = await req.json();

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const insertedStudents = [];
    const errors = [];

    for (let i = 0; i < students.length; i++) {
      const row = students[i];
      try {
        if (!row.admissionNumber || !row.name || !row.classId || !row.parentName || !row.phone) {
          throw new Error("Missing required fields");
        }

        const existingStudent = await Student.findOne({ admissionNumber: row.admissionNumber });
        if (existingStudent) {
          throw new Error(`Admission number ${row.admissionNumber} already exists`);
        }

        const newStudent = await Student.create({
          admissionNumber: row.admissionNumber,
          name: row.name,
          classId: row.classId,
          parentName: row.parentName,
          phone: row.phone,
          status: "active",
        });

        const defaultPassword = `${row.admissionNumber}`;
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        await User.create({
          username: row.admissionNumber,
          password: hashedPassword,
          role: "student",
          studentId: newStudent._id,
        });

        insertedStudents.push(newStudent);
      } catch (err: any) {
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      insertedCount: insertedStudents.length,
      errors: errors.length > 0 ? errors : undefined,
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to process bulk upload" }, { status: 500 });
  }
}
