import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Schedule Vote', description: '모임 가능한 시간 투표' };

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="ko">
      <body><div className="container">{children}</div></body>
    </html>
  );
}
