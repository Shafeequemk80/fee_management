import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Fee from "@/models/Fee";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const status = searchParams.get("status");

    const query: any = {};
    if (month) query.month = parseInt(month, 10);
    if (year) query.year = parseInt(year, 10);
    if (status && status !== "all") query.status = status;

    if (session.user.role === "student") {
      query.studentId = session.user.studentId;
    }

    await dbConnect();
    const fees = await Fee.find(query)
      .populate({ path: "studentId", select: "name admissionNumber phone", populate: { path: "classId", select: "name" } })
      .sort({ year: -1, month: -1 });

    return NextResponse.json(fees);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch fees" }, { status: 500 });
  }
}
