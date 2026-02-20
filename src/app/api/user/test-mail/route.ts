import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

export async function GET() {
  try {
    await sendMail({
      to: "dev@meo0.com",
      subject: "Praxis SMTP test",
      text: "SMTP test from Railway",
    });
    return NextResponse.json({ ok: true, message: "sent" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { ok: false, error: error.message, stack: error.stack?.split("\n").slice(0, 5) },
      { status: 500 }
    );
  }
}
