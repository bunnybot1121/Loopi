import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Space_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-mono-var',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body-var',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BugHunt — The Coding Mentor That Remembers',
  description: 'AI-powered coding practice that learns how you think, not just what you typed wrong.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${spaceMono.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
        <body suppressHydrationWarning>{children}</body>
      </html>
    </ClerkProvider>
  );
}
