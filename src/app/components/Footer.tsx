'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { 
  ArrowRight, 
  Feather,
  Mail
} from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export function Footer() {
  return (
    <footer className="bg-[#F3EFEA] border-t border-[#E3D9CC] text-[#2C2A29] pt-12 sm:pt-16 pb-8 sm:pb-12 transition-colors relative">
      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
      >
        {/* Top Section: Brand & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 sm:pb-16 border-b border-[#E3D9CC]/80">
          
          {/* Brand Info */}
          <motion.div variants={itemVariants} className="lg:col-span-5 space-y-4">
            <Link 
              href="/" 
              className="font-serif text-2xl sm:text-3xl font-medium tracking-wide inline-flex items-center gap-2 group"
            >
              <Feather className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5] group-hover:-rotate-12 transition-transform duration-300" />
              <span>Stanza.</span>
            </Link>
            <p className="text-xs sm:text-sm text-[#5A5654] leading-relaxed max-w-sm">
              A quiet digital sanctuary for contemporary poetry, verse preservation, and thoughtful writing. Free from feeds and noise.
            </p>
            
            {/* Social Icons & Gmail */}
            <div className="pt-2 flex items-center space-x-2.5 sm:space-x-3 text-[#7C7775]">
              {/* Twitter / X */}
              <motion.a 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2.5 rounded-full border border-[#E3D9CC] hover:border-[#2C2A29] hover:text-[#2C2A29] bg-[#FAF8F5]/50 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </motion.a>

              {/* GitHub */}
              <motion.a 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2.5 rounded-full border border-[#E3D9CC] hover:border-[#2C2A29] hover:text-[#2C2A29] bg-[#FAF8F5]/50 transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </motion.a>

              {/* Gmail / Email Icon */}
              <motion.a 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="mailto:contact@stanza.verse" 
                className="p-2.5 rounded-full border border-[#E3D9CC] hover:border-[#2C2A29] hover:text-[#2C2A29] bg-[#FAF8F5]/50 transition-colors"
                aria-label="Gmail / Email"
              >
                <Mail className="w-4 h-4 stroke-[1.75]" />
              </motion.a>
            </div>
          </motion.div>

          {/* Newsletter Box */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-7 bg-[#FAF8F5] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#E3D9CC]/80 shadow-sm flex flex-col justify-between"
          >
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-medium text-[#1F1E1D] mb-1">
                The Weekly Verse
              </h3>
              <p className="text-xs text-[#5A5654] mb-4">
                Curated stanzas, essay features, and new chapbook releases delivered to your inbox every Sunday.
              </p>
            </div>
            
            <form className="flex flex-col sm:flex-row gap-2.5 mt-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address..."
                className="flex-1 bg-white border border-[#E3D9CC] text-xs sm:text-sm px-4 py-3 rounded-full text-[#2C2A29] placeholder-[#7C7775] focus:outline-none focus:ring-1 focus:ring-[#2C2A29] min-h-[44px]"
                required
              />
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs sm:text-sm font-medium hover:bg-[#3D3732] transition-colors shrink-0 shadow-sm min-h-[44px]"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Navigation Links Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 sm:py-12 border-b border-[#E3D9CC]/80 text-xs sm:text-sm"
        >
          <div>
            <h4 className="font-serif font-medium text-[#1F1E1D] mb-3.5 sm:mb-4">Explore</h4>
            <ul className="space-y-2.5 text-[#5A5654]">
              <li><Link href="/feed" className="hover:text-[#2C2A29] transition-colors py-1 inline-block">Daily Poem Feed</Link></li>
              <li><Link href="/categories" className="hover:text-[#2C2A29] transition-colors py-1 inline-block">Themes & Collections</Link></li>
              <li><Link href="/" className="hover:text-[#2C2A29] transition-colors py-1 inline-block">Thinking Room Sanctuary</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-medium text-[#1F1E1D] mb-3.5 sm:mb-4">Writers</h4>
            <ul className="space-y-2.5 text-[#5A5654]">
              <li><Link href="/share" className="hover:text-[#2C2A29] transition-colors py-1 inline-block">Share Stanza & Thoughts</Link></li>
              <li><Link href="/categories" className="hover:text-[#2C2A29] transition-colors py-1 inline-block">Anthology Categories</Link></li>
              <li><Link href="/feed" className="hover:text-[#2C2A29] transition-colors py-1 inline-block">Community Feed</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-medium text-[#1F1E1D] mb-3.5 sm:mb-4">Editorial Desk</h4>
            <ul className="space-y-2.5 text-[#5A5654]">
              <li><Link href="/login" className="hover:text-[#2C2A29] transition-colors py-1 inline-block">Admin Portal</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-[#2C2A29] transition-colors py-1 inline-block">Editorial Dashboard</Link></li>
              <li><Link href="/admin/dashboard/sharecontent" className="hover:text-[#2C2A29] transition-colors py-1 inline-block">Review Submissions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-medium text-[#1F1E1D] mb-3.5 sm:mb-4">Platform</h4>
            <ul className="space-y-2.5 text-[#5A5654]">
              <li><Link href="/" className="hover:text-[#2C2A29] transition-colors py-1 inline-block">About Stanza</Link></li>
              <li><Link href="/feed" className="hover:text-[#2C2A29] transition-colors py-1 inline-block">Live Stream</Link></li>
              <li><a href="mailto:contact@stanza.verse" className="hover:text-[#2C2A29] transition-colors py-1 inline-block">Contact Editorial</a></li>
            </ul>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          variants={itemVariants}
          className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-[#7C7775] gap-3 text-center sm:text-left"
        >
          <p>© {new Date().getFullYear()} Stanza Inc. All rights reserved.</p>
          
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All systems operational</span>
          </div>
        </motion.div>

      </motion.div>
    </footer>
  );
}