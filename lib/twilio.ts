/**
 * Twilio WhatsApp REST Helper
 * 
 * Invokes Twilio's messages endpoint directly via raw HTTP fetch.
 */

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || process.env.ACCOUNT_SID_TWILIO;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || process.env.AUTH_TOKEN_TWILIO;
const FROM_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || process.env.FROM_TWILIO;
const TO_NUMBER = process.env.USER_WHATSAPP_NUMBER || process.env.TO_TWILIO;

export async function sendWhatsAppMessage(
  messageText: string,
  mediaUrl?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM_NUMBER || !TO_NUMBER) {
    console.warn("Twilio WhatsApp details are incomplete. Skipping notification.", {
      hasSid: !!ACCOUNT_SID,
      hasToken: !!AUTH_TOKEN,
      hasFrom: !!FROM_NUMBER,
      hasTo: !!TO_NUMBER,
    });
    return { success: false, error: "Missing Twilio configurations in environment" };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`;

    // Standard URL-encoded request body
    const params: Record<string, string> = {
      To: TO_NUMBER,
      From: FROM_NUMBER,
      Body: messageText,
    };

    if (mediaUrl) {
      params.MediaUrl = mediaUrl;
    }

    const body = new URLSearchParams(params);

    const basicAuth = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: body.toString(),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || `Twilio error status ${response.status}`);
    }

    console.log("Successfully sent WhatsApp update via Twilio:", responseData.sid);
    return { success: true, data: responseData };
  } catch (error: any) {
    console.error("Twilio sendWhatsAppMessage failed:", error);
    return { success: false, error: error.message || String(error) };
  }
}
