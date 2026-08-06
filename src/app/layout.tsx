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
      <body className="bg-[#FAF7F2] text-[#2C2A29] font-sans antialiased selection:bg-[#E8E2D9] selection:text-[#1A1918] min-h-screen flex flex-col relative overflow-x-hidden overflow-y-auto">
        
        {/* SVG Paper Texture Filter Overlay */}
        <div 
          className="fixed inset-0 pointer-events-none opacity-[0.035] z-50 mix-blend-multiply" 
          aria-hidden="true"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />

        {/* Global Layout Shell */}
        <div className="flex-1 flex flex-col w-full min-h-screen">
          {children}
          <Footer />
        </div>

      </body>
    </html>
  );
}