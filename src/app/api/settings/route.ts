import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
import crypto from 'crypto';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let apiKey = user.apiKey;
    
    // Lazy-generate API key if they don't have one
    if (!apiKey) {
      apiKey = `ls_${crypto.randomBytes(24).toString('hex')}`;
      user.apiKey = apiKey;
      await user.save();
    }

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}
