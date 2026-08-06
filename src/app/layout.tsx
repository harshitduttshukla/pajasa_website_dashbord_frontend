import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'City Management Dashboard | PAJASA',
  description: 'FastAPI and Next.js backend and frontend city management portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
