import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Fee from "@/models/Fee";
import Payment from "@/models/Payment";
import Student from "@/models/Student";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    await dbConnect();

    if (type === "dashboard_summary") {
      const totalStudents = await Student.countDocuments({ status: "active" });
      
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const currentFees = await Fee.find({ month: currentMonth, year: currentYear });
      
      let collectedThisMonth = 0;
      let pendingThisMonth = 0;
      let paidCount = 0;
      let unpaidCount = 0;

      for (const fee of currentFees) {
        collectedThisMonth += fee.amountPaid;
        pendingThisMonth += (fee.amount - fee.amountPaid);
        if (fee.status === "paid") {
          paidCount++;
        } else {
          unpaidCount++;
        }
      }

      return NextResponse.json({
        totalStudents,
        collectedThisMonth,
        pendingThisMonth,
        paidCount,
        unpaidCount
      });
    }

    if (type === "unpaid_list") {
      const unpaidFees = await Fee.find({ status: { $in: ["unpaid", "partial"] } })
        .populate("studentId", "name admissionNumber phone classId")
        .sort({ year: -1, month: -1 });
      
      return NextResponse.json(unpaidFees);
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
