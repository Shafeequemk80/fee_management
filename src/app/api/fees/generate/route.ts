import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import Fee from "@/models/Fee";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { month, year, dueDate } = await req.json();

    if (!month || !year || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    
    // Get all active students with their class structure
    const students = await Student.find({ status: "active" }).populate("classId");

    let generatedCount = 0;
    let skippedCount = 0;

    for (const student of students) {
      // Determine fee amount: Custom Fee overrides Class Fee
      let amount = 0;
      if (student.customMonthlyFee && student.customMonthlyFee > 0) {
        amount = student.customMonthlyFee;
      } else if (student.classId && student.classId.monthlyFee) {
        amount = student.classId.monthlyFee;
      }

      if (amount <= 0) {
        skippedCount++;
        continue;
      }

      // Check if fee already exists for this month/year for the student
      const existingFee = await Fee.findOne({
        studentId: student._id,
        month: parseInt(month, 10),
        year: parseInt(year, 10)
      });

      if (!existingFee) {
        await Fee.create({
          studentId: student._id,
          month: parseInt(month, 10),
          year: parseInt(year, 10),
          amount,
          amountPaid: 0,
          status: "unpaid",
          dueDate: new Date(dueDate),
        });
        generatedCount++;
      } else {
        skippedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      generated: generatedCount,
      skipped: skippedCount,
      message: `Generated ${generatedCount} fees. Skipped ${skippedCount} existing or invalid fees.`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate fees" }, { status: 500 });
  }
}
