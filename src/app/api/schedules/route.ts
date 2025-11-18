import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const r = await fetch(`${process.env.API_SERVER}/schedules`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(body)
  });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
