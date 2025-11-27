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
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return jsonResponse({ error: "Missing transaction id in path" }, 400);
  }

  const PUBLIC_KEY = process.env.BLACKCAT_PUBLIC_KEY;
  const SECRET_KEY = process.env.BLACKCAT_SECRET_KEY;

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