import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const base = process.env.API_NAME!;
  const r = await fetch(`${base}/generate`, { cache: 'no-store' });
  const data = await r.json();
  return NextResponse.json(data);
}
