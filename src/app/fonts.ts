import localFont from 'next/font/local';

export const suit = localFont({
  src: [
    { path: './fonts/SUIT-Variable.woff2', style: 'normal', weight: '100 900' },
  ],
  variable: '--font-suit',
  display: 'swap',
});