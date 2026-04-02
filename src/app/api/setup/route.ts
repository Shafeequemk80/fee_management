import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();

    // Check if admin already exists
    const adminExists = await User.findOne({ role: "admin" });

    if (adminExists) {
      return NextResponse.json({ message: " user already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash("Cholayil@123", 10);

    const newAdmin = await User.create({
      username: "Chola123",
      password: hashedPassword,
      role: "admin",
    });

    return NextResponse.json(
      { message: "Admin user created successfully", user: newAdmin.username },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
  }
}
