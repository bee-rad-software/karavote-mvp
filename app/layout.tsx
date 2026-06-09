import './globals.css';
import type { Metadata } from 'next';

export const metadata = {
  title: 'StageVotes',
  description: 'Live audience voting for karaoke contests',
  icons: {
    icon: '/stagevotes-logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
