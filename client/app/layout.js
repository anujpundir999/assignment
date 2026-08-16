import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HR Workspace',
  description: 'Streamlined employee management, attendance tracking, and workforce analytics'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-zinc-950 text-zinc-100 min-h-screen selection:bg-zinc-800 selection:text-zinc-100`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
