import type { Metadata } from 'next';
import '../styles/globals.css';
import { AppProvider } from '@/lib/context';
import Shell from '@/components/Shell';

export const metadata: Metadata = {
  title: 'PersonalOS — Goal & Habit System',
  description: 'A universal personal operating system. Set your goals, build your habits, and track your progress on your own timeline.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
