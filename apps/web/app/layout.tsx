import type { ReactNode } from 'react';
import './globals.css';
import { themeInitScript } from '../src/lib/theme';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Blocking script — runs before paint to prevent theme flash */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
