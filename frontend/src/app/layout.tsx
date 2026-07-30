import './globals.css';
import { AuthGuard } from '@/components/AuthGuard';

export const metadata = {
  title: 'Vyora — AI Financial Intelligence Platform',
  description: 'Enterprise AI personal finance management SaaS platform powered by Google Gemini API and predictive spending analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0F17] text-slate-100 min-h-screen selection:bg-blue-500 selection:text-white">
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
