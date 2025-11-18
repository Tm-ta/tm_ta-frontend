import { NextRequest, NextResponse } from 'next/server';

const MAP = {
  server: 'https://server.tm-ta.com',
  name:   'https://name.tm-ta.com',
  fb:     'https://feedback.tm-ta.com',
} as const;

export async function GET(req: NextRequest, { params }: { params: { slug?: string[] } }) {
  return handle(req, params);
}
export async function POST(req: NextRequest, { params }: { params: { slug?: string[] } }) {
  return handle(req, params);
}
export async function PUT(req: NextRequest, { params }: { params: { slug?: string[] } }) {
  return handle(req, params);
}

async function handle(req: NextRequest, { slug }: { slug?: string[] }) {
  // /api/x/{key}/...  형태에서 key 추출
  const [key, ...rest] = slug ?? [];
  const base = MAP[key as keyof typeof MAP];
  if (!base) return NextResponse.json({ error: 'invalid proxy key' }, { status: 400 });

  const url = new URL(req.url);
  const qs  = url.search; // 쿼리 그대로 유지
  const target = `${base}/${rest.join('/')}${qs}`;

  const init: RequestInit = {
    method: req.method,
    headers: { 'content-type': req.headers.get('content-type') ?? '' },
    body: req.method === 'GET' ? undefined : await req.text(),
    cache: 'no-store',
  };

  const r = await fetch(target, init);
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') ?? 'application/json' }
  });
}
