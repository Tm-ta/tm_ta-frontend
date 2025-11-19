import { NextRequest, NextResponse } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: { id: string }}) {
  const r = await fetch(`${process.env.API_SERVER}/groups/${params.id}`, { cache: 'no-store' });
  const data = await r.json();
  return NextResponse.json(data);
}
