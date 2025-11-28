import './globals.css';
import type { Metadata } from 'next';
import { suit } from './fonts';

export const metadata: Metadata = { title: 'Tm:ta', description: '모임 가능한 시간 투표' };

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="ko" >
      <body className={suit.className}>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
