import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const PUBLIC_KEY = process.env.BLACKCAT_PUBLIC_KEY;
  const SECRET_KEY = process.env.BLACKCAT_SECRET_KEY;

  if (!PUBLIC_KEY || !SECRET_KEY) {
    return NextResponse.json(
      { error: "Server misconfiguration: missing Blackcat keys" },
      { status: 500 }
    );
  }

  const auth = "Basic " + Buffer.from(`${PUBLIC_KEY}:${SECRET_KEY}`).toString("base64");

  const response = await fetch("https://api.blackcatpagamentos.com/v1/transactions", {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}