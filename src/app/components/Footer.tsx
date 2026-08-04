'use client';

import Link from 'next/link';
import { 
  ArrowRight, 
  Feather 
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#F3EFEA] border-t border-[#E3D9CC] text-[#2C2A29] pt-16 pb-12 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Top Section: Brand & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[#E3D9CC]/80">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="font-serif text-3xl font-medium tracking-wide inline-flex items-center gap-2">
              <Feather className="w-6 h-6 stroke-[1.5]" />
              <span>Stanza.</span>
            </Link>
            <p className="text-sm text-[#5A5654] leading-relaxed max-w-sm">
              A quiet digital sanctuary for contemporary poetry, verse preservation, and thoughtful writing. Free from feeds and noise.
            </p>
            
            {/* Social Icons (Inline SVG for clean brand rendering) */}
            <div className="pt-2 flex items-center space-x-3 text-[#7C7775]">
              {/* Twitter / X */}
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2.5 rounded-full border border-[#E3D9CC] hover:border-[#2C2A29] hover:text-[#2C2A29] transition-all"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* GitHub */}
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2.5 rounded-full border border-[#E3D9CC] hover:border-[#2C2A29] hover:text-[#2C2A29] transition-all"
                aria-label="GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-7 bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-[#E3D9CC]/70 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-xl font-medium text-[#1F1E1D] mb-1">
                The Weekly Verse
              </h3>
              <p className="text-xs text-[#5A5654] mb-4">
                Curated stanzas, essay features, and new chapbook releases delivered to your inbox every Sunday.
              </p>
            </div>
            
            <form className="flex flex-col sm:flex-row gap-2 mt-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address..."
                className="flex-1 bg-white border border-[#E3D9CC] text-sm px-4 py-2.5 rounded-full text-[#2C2A29] placeholder-[#7C7775] focus:outline-none focus:ring-1 focus:ring-[#2C2A29]"
                required
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-sm font-medium hover:bg-opacity-90 transition-all shrink-0"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-[#E3D9CC]/80 text-sm">
          <div>
            <h4 className="font-serif font-medium text-[#1F1E1D] mb-4">Explore</h4>
            <ul className="space-y-2.5 text-[#5A5654]">
              <li><Link href="/explore" className="hover:text-[#2C2A29] transition-colors">Daily Poem</Link></li>
              <li><Link href="/collections" className="hover:text-[#2C2A29] transition-colors">Featured Chapbooks</Link></li>
              <li><Link href="/topics" className="hover:text-[#2C2A29] transition-colors">Topics & Forms</Link></li>
              <li><Link href="/audio" className="hover:text-[#2C2A29] transition-colors">Spoken Word</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-medium text-[#1F1E1D] mb-4">Writers</h4>
            <ul className="space-y-2.5 text-[#5A5654]">
              <li><Link href="/editor" className="hover:text-[#2C2A29] transition-colors">Distraction-Free Editor</Link></li>
              <li><Link href="/guide" className="hover:text-[#2C2A29] transition-colors">Formatting Guide</Link></li>
              <li><Link href="/publish" className="hover:text-[#2C2A29] transition-colors">Publishing Chapbooks</Link></li>
              <li><Link href="/guidelines" className="hover:text-[#2C2A29] transition-colors">Writer Guidelines</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-medium text-[#1F1E1D] mb-4">Platform</h4>
            <ul className="space-y-2.5 text-[#5A5654]">
              <li><Link href="/about" className="hover:text-[#2C2A29] transition-colors">About Stanza</Link></li>
              <li><Link href="/manifesto" className="hover:text-[#2C2A29] transition-colors">Our Manifesto</Link></li>
              <li><Link href="/pricing" className="hover:text-[#2C2A29] transition-colors">Membership</Link></li>
              <li><Link href="/changelog" className="hover:text-[#2C2A29] transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-medium text-[#1F1E1D] mb-4">Legal</h4>
            <ul className="space-y-2.5 text-[#5A5654]">
              <li><Link href="/privacy" className="hover:text-[#2C2A29] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#2C2A29] transition-colors">Terms of Service</Link></li>
              <li><Link href="/copyright" className="hover:text-[#2C2A29] transition-colors">Copyright & IP</Link></li>
              <li><Link href="/contact" className="hover:text-[#2C2A29] transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#7C7775] gap-4">
          <p>© {new Date().getFullYear()} Stanza Inc. All rights reserved.</p>
          
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
}