import { NextResponse } from "next/server";

const BLACKCAT_URL = "https://api.blackcatpagamentos.com/v1/transactions";

/**
 * Helper to build a JSON response with status and message.
 */
function jsonResponse(body: object, status = 200) {
  return NextResponse.json(body, { status });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return jsonResponse({ error: "Missing transaction id in path" }, 400);
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

  const auth = "Basic " + Buffer.from(`${PUBLIC_KEY}:${SECRET_KEY}`).toString("base64");

  let response: Response;
  try {
    response = await fetch(`${BLACKCAT_URL}/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        Authorization: auth,
        Accept: "application/json",
      },
    });
  } catch (err: any) {
    console.error("Error proxying GET to Blackcat:", err);
    return jsonResponse({ error: "Network error when contacting Blackcat", details: String(err) }, 502);
  }

  const text = await response.text().catch(() => null);
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      data = { raw: text };
    }
  }

  return NextResponse.json(data ?? { message: "No content from Blackcat" }, { status: response.status ?? 502 });
}