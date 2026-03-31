import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";
import Fee from "@/models/Fee";
import User from "@/models/User"; // Need to ensure the models are defined globally to prevent OverwriteModelError

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { feeId, studentId, amountPaid, method } = await req.json();

    if (!feeId || !studentId || !amountPaid || !method) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await dbConnect();

    // Verify Fee
    const fee = await Fee.findById(feeId);
    if (!fee) return NextResponse.json({ error: "Fee record not found" }, { status: 404 });

    const remainingDue = fee.amount - fee.amountPaid;

    if (amountPaid > remainingDue) {
      return NextResponse.json({ error: "Payment amount exceeds due amount" }, { status: 400 });
    }

    // Generate unique receipt number
    const receiptNumber = `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payment = await Payment.create({
      feeId,
      studentId,
      amount: amountPaid,
      method,
      receiptNumber
    });

    // Update Fee Status
    fee.amountPaid += amountPaid;
    if (fee.amountPaid >= fee.amount) {
      fee.status = "paid";
    } else {
      fee.status = "partial";
    }

    await fee.save();

    return NextResponse.json({
      success: true,
      payment,
      feeStatus: fee.status,
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const feeId = searchParams.get("feeId");

    const query: any = {};
    if (studentId) query.studentId = studentId;
    if (feeId) query.feeId = feeId;

    if (session.user.role === "student") {
      query.studentId = session.user.studentId;
    }

    await dbConnect();
    const payments = await Payment.find(query).sort({ date: -1 });

    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
