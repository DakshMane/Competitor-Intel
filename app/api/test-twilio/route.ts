import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/twilio";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const result = await sendWhatsAppMessage("🚨 *IntelDash Test Alert* 🚨\n\nYour Twilio WhatsApp notification integration is successfully connected and working!");

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Test message sent successfully!",
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || String(err),
      },
      { status: 500 }
    );
  }
}
