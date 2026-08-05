"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Bookmark,
  Share2,
  Play,
  Sparkles,
  TrendingUp,
  Feather,
  BookOpen,
  Quote,
  MessageSquare,
} from "lucide-react";

interface PoemPost {
  id: string;
  title: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  stanza: string;
  category: string;
  readTime: string;
  likes: number;
  comments: number;
  hasAudio?: boolean;
  date: string;
}

const feedPoems: PoemPost[] = [
  {
    id: "1",
    title: "Solitude in Quiet Light",
    author: {
      name: "Elena Rostova",
      handle: "@elena_rostova",
      avatar: "ER",
    },
    stanza: `The quiet does not ask for answers,
it only holds the space
where light settles on wooden floors,
and time forgets its pace.

We gather moments, unannounced,
like dust upon the sill,
and learn that silence, when embraced,
is louder than the hill.`,
    category: "Reflections",
    readTime: "2 min read",
    likes: 342,
    comments: 28,
    hasAudio: true,
    date: "2 hours ago",
  },
  {
    id: "2",
    title: "Tide & Timber",
    author: {
      name: "Julian Vance",
      handle: "@jvance_verse",
      avatar: "JV",
    },
    stanza: `Salt marks the edge of where we stood,
a pale line drawn by foam.
The ocean reclaims what it gave,
and carries timber home.

No anchor holds against the turn,
no prayer stops the swell;
we are but drift along the shore,
listening to the shell.`,
    category: "Nature & Sea",
    readTime: "1 min read",
    likes: 189,
    comments: 14,
    hasAudio: false,
    date: "5 hours ago",
  },
  {
    id: "3",
    title: "Midnight Epilogue",
    author: {
      name: "Aria Sterling",
      handle: "@aria_poetics",
      avatar: "AS",
    },
    stanza: `The ink runs dry before the thought is complete.
A candle flickers down to its waxen grave,
leaving only shadows to dance upon the linen.

If you find this page tomorrow,
know that it was written in the hour
between remembering and letting go.`,
    category: "Free Verse",
    readTime: "3 min read",
    likes: 512,
    comments: 42,
    hasAudio: true,
    date: "1 day ago",
  },
];

// Motion Variants for Premium Editorial Transitions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // Custom subtle cubic-bezier easing
    },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2A29] relative overflow-x-hidden font-sans">
      {/* Tactile Book-Paper Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035] z-50 mix-blend-multiply"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 grid lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Main Feed Section (Col 8) */}
        <main className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Feed Filter Bar / Book Section Header */}
          <div className="flex items-center justify-between border-b border-[#E3D9CC] pb-3 sm:pb-4">
            <div className="flex items-center gap-4 sm:gap-6">
              <button className="flex items-center gap-2 font-serif text-xs sm:text-sm font-medium text-[#2C2A29] border-b-2 border-[#2C2A29] pb-3 sm:pb-4 -mb-[14px] sm:-mb-[18px]">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2C2A29]" />
                <span>Anthology Feed</span>
              </button>
              <button className="flex items-center gap-2 font-serif text-xs sm:text-sm text-[#7C7775] hover:text-[#2C2A29] pb-3 sm:pb-4 -mb-[14px] sm:-mb-[18px] transition-colors">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Trending Stanzas</span>
              </button>
            </div>
            <span className="hidden sm:inline-block text-[10px] sm:text-[11px] font-mono text-[#8C827A] uppercase tracking-widest">
              Issue No. 128
            </span>
          </div>

          {/* Prompt / Write Banner styled as a Journal Entry */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="p-4 sm:p-6 rounded-2xl bg-[#F3EFEA]/80 border border-[#E3D9CC] shadow-[0_2px_10px_rgba(44,42,41,0.02)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E8E2D9] border border-[#D8D2C6] flex items-center justify-center font-serif text-xs sm:text-sm font-medium text-[#2C2A29] shrink-0">
                ER
              </div>
              <div>
                <p className="font-serif text-xs sm:text-sm font-medium text-[#2C2A29]">
                  Compose a new stanza...
                </p>
                <p className="text-[11px] sm:text-xs text-[#7C7775]">
                  What quiet thoughts need room to breathe today?
                </p>
              </div>
            </div>
            <motion.div whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
              <Link
                href="/share"
                className="w-full sm:w-auto block text-center px-4 py-2 sm:py-2 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] transition-colors shrink-0 shadow-sm active:scale-98"
              >
                Write Verse
              </Link>
            </motion.div>
          </motion.div>

          {/* Feed Cards List with Animated Stagger */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 sm:space-y-8"
          >
            {feedPoems.map((poem) => (
              <motion.article
                key={poem.id}
                variants={itemVariants}
                className="group relative bg-[#FAF8F5] border border-[#E3D9CC] rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-[0_4px_20px_rgba(44,42,41,0.02)] hover:shadow-[0_8px_30px_rgba(44,42,41,0.05)] hover:border-[#D5C9B8] transition-all duration-300"
              >
                {/* Simulated Book Page Binding Line */}
                <div className="absolute left-0 top-6 bottom-6 w-[3px] bg-[#E8E2D9] rounded-r-full" />

                {/* Card Header: Author & Meta */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-6 pl-1 sm:pl-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E8E2D9] border border-[#D8D2C6] flex items-center justify-center font-serif text-xs font-medium text-[#2C2A29] shrink-0">
                      {poem.author.avatar}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-serif text-xs sm:text-sm font-medium text-[#2C2A29]">
                          {poem.author.name}
                        </span>
                        <span className="text-[11px] sm:text-xs text-[#8C827A]">
                          {poem.author.handle}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#8C827A]">
                        <span>{poem.date}</span>
                        <span>•</span>
                        <span>{poem.readTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-2.5 py-1 rounded-full bg-[#F3EFEA] border border-[#E3D9CC] text-[9px] sm:text-[10px] font-mono text-[#7C7775] uppercase tracking-wider">
                      {poem.category}
                    </span>
                    {poem.hasAudio && (
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        className="p-1.5 sm:p-2 rounded-full bg-[#2C2A29] text-[#FAF8F5] hover:bg-[#3D3732] transition-colors"
                        title="Listen to Spoken Recitation"
                      >
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Card Content: Title & Poem Body */}
                <div className="pl-1 sm:pl-2 pr-1 sm:pr-2 mb-6 sm:mb-8">
                  <h2 className="font-serif text-lg sm:text-2xl text-[#1F1E1D] font-normal tracking-tight mb-3 sm:mb-4 group-hover:text-[#4A423A] transition-colors">
                    {poem.title}
                  </h2>
                  <blockquote className="font-serif text-base sm:text-lg leading-relaxed sm:leading-loose text-[#2C2A29] whitespace-pre-line pl-3 sm:pl-4 border-l-2 border-[#D8D2C6] italic">
                    {poem.stanza}
                  </blockquote>
                </div>

                {/* Card Footer: Interaction Bar */}
                <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-[#E3D9CC]/70 pl-1 sm:pl-2">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center gap-1.5 text-xs text-[#665E56] hover:text-[#8C3A32] transition-colors py-1"
                    >
                      <Heart className="w-4 h-4" />
                      <span>{poem.likes}</span>
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center gap-1.5 text-xs text-[#665E56] hover:text-[#2C2A29] transition-colors py-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{poem.comments}</span>
                    </motion.button>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-3">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-[#665E56] hover:text-[#2C2A29] transition-colors"
                      title="Save Stanza"
                    >
                      <Bookmark className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-[#665E56] hover:text-[#2C2A29] transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </main>

        {/* Sidebar Column: Curator Notes & Featured Anthology (Col 4) */}
        <aside className="lg:col-span-4 space-y-6 sm:space-y-8">
          {/* Curator Note Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#F3EFEA]/90 border border-[#E3D9CC] shadow-sm space-y-3.5 sm:space-y-4"
          >
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-[#7C7775] uppercase tracking-widest">
              <Quote className="w-3.5 h-3.5 text-[#2C2A29]" />
              <span>Editor&apos;s Note</span>
            </div>
            <p className="font-serif text-xs sm:text-sm italic text-[#4A423A] leading-relaxed">
              &ldquo;Poetry is an act of quiet preservation. In this room,
              every line is given space to resonate without competition.&rdquo;
            </p>
            <div className="pt-2 border-t border-[#E3D9CC]/60 flex items-center justify-between">
              <span className="text-xs font-serif font-medium text-[#2C2A29]">
                Stanza Editorial Board
              </span>
              <span className="text-[10px] font-mono text-[#8C827A]">
                Vol. IV
              </span>
            </div>
          </motion.div>

          {/* Weekly Chapbook Spotlight */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#2C2723] text-[#FAF8F5] space-y-3.5 sm:space-y-4 shadow-md relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <BookOpen className="w-20 h-20 sm:w-24 sm:h-24 text-[#FAF8F5]" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C4BBAF] block">
              Featured Chapbook
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-normal text-[#FAF8F5]">
              &ldquo;Whispers of Autumn Light&rdquo;
            </h3>
            <p className="text-xs text-[#C4BBAF] leading-relaxed">
              A curated collection of 12 contemporary works exploring
              transition, memory, and silence.
            </p>
            <Link
              href="/chapbooks/autumn-light"
              className="inline-flex items-center gap-2 pt-1 sm:pt-2 text-xs font-serif text-[#D8D2C6] hover:text-[#FAF8F5] transition-colors group"
            >
              <span>Read Collection</span>
              <Feather className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          {/* Popular Categories Tag Cloud */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FAF8F5] border border-[#E3D9CC] space-y-3.5 sm:space-y-4"
          >
            <h4 className="font-serif text-xs sm:text-sm font-medium text-[#2C2A29]">
              Explore Categories
            </h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {[
                "Reflections",
                "Free Verse",
                "Sonnets",
                "Nature & Sea",
                "Nocturne",
                "Elegies",
                "Urban Life",
              ].map((tag) => (
                <motion.div key={tag} whileTap={{ scale: 0.95 }}>
                  <Link
                    href={`/categories/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                    className="inline-block px-3 py-1.5 rounded-full bg-[#F3EFEA] border border-[#E3D9CC] text-[11px] sm:text-xs text-[#5A5654] hover:bg-[#2C2A29] hover:text-[#FAF8F5] transition-all"
                  >
                    {tag}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}