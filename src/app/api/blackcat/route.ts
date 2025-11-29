import { NextResponse } from "next/server";

const BLACKCAT_URL = "https://api.blackcatpagamentos.com/v1/transactions";

/**
 * Helper to build a JSON response with status and message.
 */
function jsonResponse(body: object, status = 200) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  // Simple health check for the API route
  return jsonResponse({ ok: true, message: "Blackcat proxy is available" });
}

export async function POST(req: Request) {
  // Ensure request has a JSON body
  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  // Temporarily hardcoding keys to ensure they are available in production.
  // WARNING: This is not a secure practice. Keys should be in environment variables.
  const PUBLIC_KEY = "pk_QeH6GwZYP3KPXMdRPDIC9VzFo8CDqLATI7f764w1KQxkYRtB";
  const SECRET_KEY = "sk_jatFTlsz-CMluRfzHixO_ax-b5l9gTH2ulxu8-pujt5piFu8";

  if (!PUBLIC_KEY || !SECRET_KEY) {
    return jsonResponse(
      { error: "Server misconfiguration: missing Blackcat keys (set BLACKCAT_PUBLIC_KEY and BLACKCAT_SECRET_KEY)" },
      500
    );
  }

  // Build Basic auth header
  // Buffer is available in Node; this code runs server-side.
  const auth = "Basic " + Buffer.from(`${PUBLIC_KEY}:${SECRET_KEY}`).toString("base64");

  // Proxy request to Blackcat
  let response: Response;
  try {
    response = await fetch(BLACKCAT_URL, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (err: any) {
    // Network or other low-level error
    console.error("Error proxying to Blackcat:", err);
    return jsonResponse({ error: "Network error when contacting Blackcat", details: String(err) }, 502);
  }

  // Try to parse JSON from the gateway
  let data: any = null;
  const text = await response.text().catch(() => null);
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      // Gateway returned non-JSON body; forward as text
      data = { raw: text };
    }
  }

  // Forward status and parsed body
  const status = response.status ?? 502;
  return NextResponse.json(data ?? { message: "No content from Blackcat" }, { status });
}