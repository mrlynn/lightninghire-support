// src/app/layout.js
import { Inter } from 'next/font/google';
import ThemeProvider from '@/components/ThemeProvider';
import AuthProvider from '@/components/AuthProvider';
import { UserActivityProvider } from '@/context/UserActivityContext';
import ImpersonationControls from '@/components/admin/ImpersonationControls';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'LightningHire Support Center',
  description: 'Knowledge base and support for LightningHire - AI-powered resume evaluation system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}> 
        <AuthProvider>
          <UserActivityProvider>
            <ThemeProvider>
              {children}
              <ImpersonationControls />
            </ThemeProvider>
          </UserActivityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}