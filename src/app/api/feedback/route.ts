import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { text, groupId, meta } = await req.json();
  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }

  const base = process.env.API_FEEDBACK!;
  const r = await fetch(`${base}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ text, groupId, meta })
  });

  const body = await r.text();
  if (!r.ok) return new NextResponse(body || 'feedback error', { status: r.status });
  try { return NextResponse.json(JSON.parse(body)); }
  catch { return new NextResponse(body, { status: 200 }); }
}
