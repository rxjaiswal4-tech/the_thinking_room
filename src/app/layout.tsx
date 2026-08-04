import type { Metadata } from 'next';
import { Lora, Inter } from 'next/font/google';
import { Footer } from './components/Footer';
import './globals.css';

const lora = Lora({ 
  subsets: ['latin'], 
  variable: '--font-lora',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Stanza — Where words find room to breathe',
  description: 'A quiet digital sanctuary for contemporary poetry and verse preservation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable}`}>
      <body className="bg-[#FAF8F5] text-[#2C2A29] font-sans antialiased selection:bg-[#E8E2D9] min-h-screen flex flex-col justify-between">
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}