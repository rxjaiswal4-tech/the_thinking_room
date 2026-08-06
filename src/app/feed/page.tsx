"use client";

<<<<<<< HEAD
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
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
  Clock,
  Calendar,
  User,
  Tag,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Author {
  name: string;
  handle: string;
  avatar: string;
}

interface PoemPost {
  id: string;
  title: string;
  category: string;
  author: Author;
  stanza: string;
  readTime: string;
  likes: number;
  comments: number;
  hasAudio?: boolean;
  publishedAt: string;
  updatedAt: string;
}

// Lightweight animation variants safe for IoT hardware and mobile GPUs
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.02 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] },
  },
};

export default function Home() {
  const [feedPoems, setFeedPoems] = useState<PoemPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoems() {
      const { data, error } = await supabase
        .from("poems")
        .select(`
          id,
          title,
          stanza,
          category,
          read_time,
          likes,
          comments,
          has_audio,
          created_at,
          updated_at,
          authors (
            name,
            handle,
            avatar
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching poems:", error);
      } else if (data) {
        const formattedPoems: PoemPost[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          category: item.category || "Philosophy",
          author: {
            name: item.authors?.name || "John Doe",
            handle: item.authors?.handle || "@johndoe",
            avatar: item.authors?.avatar || "JD",
          },
          stanza: item.stanza,
          readTime: item.read_time || "3 min read",
          likes: item.likes || 0,
          comments: item.comments || 0,
          hasAudio: item.has_audio || false,
          publishedAt: new Date(item.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          updatedAt: new Date(item.updated_at || item.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
        }));
        setFeedPoems(formattedPoems);
      }
      setLoading(false);
    }

    fetchPoems();
  }, []);
=======
import React from "react";
import { Feather, Share2, Sparkles } from "lucide-react";

interface Stanza {
  id: string;
  title: string;
  body: string;
  author: string;
  category: string;
  date: string;
}

const mockStanzas: Stanza[] = [
  {
    id: "1",
    title: "solif",
    body: "fuck you",
    author: "gij",
    category: "FREE VERSE",
    date: "Aug 5, 2026",
  },
];
>>>>>>> 328aa16e779d4c6fa31a9fa60daf0538958cb993

export default function FeedPage() {
  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2A29] relative overflow-x-hidden font-sans antialiased touch-manipulation">
      {/* Subtle Noise Texture Background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035] z-50 mix-blend-multiply"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        
        {/* Main Feed Section */}
        <main className="lg:col-span-8 space-y-6 sm:space-y-8">
          
          {/* Feed Header Navigation */}
          <nav className="flex items-center justify-between border-b border-[#E3D9CC] pb-3 sm:pb-4">
            <div className="flex items-center gap-3 sm:gap-6">
              <button className="flex items-center gap-2 font-serif text-xs sm:text-sm font-semibold text-[#2C2A29] border-b-2 border-[#2C2A29] pb-3 sm:pb-4 -mb-[14px] sm:-mb-[18px] min-h-[44px]">
                <Sparkles className="w-4 h-4 text-[#2C2A29]" />
                <span>Anthology Feed</span>
              </button>
              <button className="flex items-center gap-2 font-serif text-xs sm:text-sm text-[#7C7775] hover:text-[#2C2A29] pb-3 sm:pb-4 -mb-[14px] sm:-mb-[18px] transition-colors min-h-[44px]">
                <TrendingUp className="w-4 h-4" />
                <span>Trending Works</span>
              </button>
            </div>
            <span className="hidden sm:inline-block text-[10px] sm:text-[11px] font-mono text-[#8C827A] uppercase tracking-widest">
              Issue No. 128
            </span>
          </nav>

          {/* Create Post Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#F3EFEA]/80 border border-[#E3D9CC] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#E8E2D9] border border-[#D8D2C6] flex items-center justify-center font-serif text-sm font-semibold text-[#2C2A29] shrink-0">
                ER
              </div>
              <div>
                <p className="font-serif text-sm font-medium text-[#2C2A29]">
                  Compose a new article or stanza...
                </p>
                <p className="text-xs text-[#7C7775]">
                  What quiet thoughts need room to breathe today?
                </p>
=======
    <div className="w-full flex flex-col gap-8">
      {/* Feed Header */}
      <header className="text-center space-y-2 py-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2EFE9] border border-[#E5E0D8] text-[11px] font-mono tracking-widest uppercase text-[#8C827A]">
          <Sparkles className="w-3 h-3 text-[#B0A69A]" />
          The Daily Anthology
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl italic text-[#2C2723]">
          Poetic Stream
        </h1>
        <p className="text-xs sm:text-sm text-[#786F66] font-serif italic">
          A silent space for original verse and unhurried thoughts.
        </p>
      </header>

      {/* Quick Post Prompt */}
      <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#EAE8E4] shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-[#665E56]">
          <div className="p-2 rounded-xl bg-[#F3F0EA] border border-[#E8E4DC]">
            <Feather className="w-4 h-4 text-[#4A423A]" />
          </div>
          <span className="font-serif text-sm italic">
            Have a stanza waiting to be written?
          </span>
        </div>
        <button className="px-4 py-1.5 rounded-full bg-[#2C2723] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] transition-all shrink-0">
          Publish
        </button>
      </div>

      {/* Feed List */}
      <div className="flex flex-col gap-6">
        {mockStanzas.map((stanza) => (
          <article
            key={stanza.id}
            className="p-6 sm:p-8 rounded-3xl bg-[#FAFAFA] border border-[#EAE8E4] shadow-sm flex flex-col gap-6 hover:border-[#DCD7CE] transition-colors"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-4">
              <h2 className="font-serif text-xl font-medium text-[#2C2723]">
                {stanza.title}
              </h2>
              <span className="text-[10px] font-mono tracking-wider text-[#8C827A] bg-[#F2EFE9] px-2.5 py-1 rounded-md border border-[#E5E0D8]">
                {stanza.category}
              </span>
            </div>

            {/* Card Body / Poem */}
            <div className="py-2">
              <p className="font-serif text-base sm:text-lg text-[#38332E] leading-relaxed whitespace-pre-line italic">
                {stanza.body}
              </p>
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#F0ECE4] text-xs text-[#8C827A]">
              <div>
                <span className="font-serif font-medium text-[#2C2723] block">
                  {stanza.author}
                </span>
                <span className="text-[10px] font-mono">
                  Uploaded {stanza.date}
                </span>
>>>>>>> 328aa16e779d4c6fa31a9fa60daf0538958cb993
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#F3F0EA] text-[#665E56] transition-colors border border-transparent hover:border-[#E8E4DC]">
                <Share2 className="w-3.5 h-3.5" />
                <span className="text-xs font-serif">Share</span>
              </button>
            </div>
<<<<<<< HEAD
            <Link
              href="/share"
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-5 py-2 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif font-medium hover:bg-[#3D3732] active:scale-98 transition-all shadow-sm shrink-0"
            >
              Write Article
            </Link>
          </motion.div>

          {/* Feed Content Loader & List */}
          {loading ? (
            <div className="text-center py-16 font-serif text-[#7C7775] space-y-3" aria-live="polite">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#8C827A]" />
              <p className="text-sm">Gathering philosophical works...</p>
            </div>
          ) : feedPoems.length === 0 ? (
            <div className="text-center py-16 font-serif text-[#7C7775] bg-[#FAF8F5] rounded-2xl border border-[#E3D9CC]">
              No articles found. Be the first to publish a piece!
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 sm:space-y-8"
            >
              {feedPoems.map((poem) => (
                <ArticleCard key={poem.id} poem={poem} />
              ))}
            </motion.div>
          )}
        </main>

        {/* Sidebar Section */}
        <aside className="lg:col-span-4 space-y-6 sm:space-y-8">
          
          {/* Editor's Note */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-5 sm:p-6 rounded-2xl bg-[#F3EFEA]/90 border border-[#E3D9CC] shadow-sm space-y-3"
          >
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-[#7C7775] uppercase tracking-widest">
              <Quote className="w-3.5 h-3.5 text-[#2C2A29]" />
              <span>Editor&apos;s Note</span>
            </div>
            <p className="font-serif text-xs sm:text-sm italic text-[#4A423A] leading-relaxed">
              &ldquo;Critical thinking is an act of quiet preservation. In this room,
              every line is given space to resonate without competition.&rdquo;
            </p>
            <div className="pt-3 border-t border-[#E3D9CC]/60 flex items-center justify-between text-xs">
              <span className="font-serif font-medium text-[#2C2A29]">
                Stanza Editorial Board
              </span>
              <span className="font-mono text-[10px] text-[#8C827A]">
                Vol. IV
              </span>
            </div>
          </motion.div>

          {/* Featured Chapbook */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-5 sm:p-6 rounded-2xl bg-[#2C2723] text-[#FAF8F5] space-y-3.5 shadow-md relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <BookOpen className="w-24 h-24 text-[#FAF8F5]" />
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
              className="inline-flex items-center gap-2 min-h-[44px] text-xs font-serif text-[#D8D2C6] hover:text-[#FAF8F5] transition-colors group"
            >
              <span>Read Collection</span>
              <Feather className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-5 sm:p-6 rounded-2xl bg-[#FAF8F5] border border-[#E3D9CC] space-y-3.5"
          >
            <h4 className="font-serif text-xs sm:text-sm font-medium text-[#2C2A29]">
              Categories
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                "Philosophy",
                "Reflections",
                "Free Verse",
                "Sonnets",
                "Nature & Sea",
                "Nocturne",
                "Elegies",
                "Urban Life",
              ].map((tag) => (
                <Link
                  key={tag}
                  href={`/categories/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                  className="inline-flex items-center min-h-[36px] px-3 py-1.5 rounded-full bg-[#F3EFEA] border border-[#E3D9CC] text-xs text-[#5A5654] hover:bg-[#2C2A29] hover:text-[#FAF8F5] transition-all"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </motion.div>
        </aside>

=======
          </article>
        ))}
>>>>>>> 328aa16e779d4c6fa31a9fa60daf0538958cb993
      </div>
    </div>
  );
}

{/* Article Card Component adhering strictly to your structural prompt */}
function ArticleCard({ poem }: { poem: PoemPost }) {
  return (
    <motion.article
      variants={itemVariants}
      className="group bg-[#FAF8F5] border border-[#E3D9CC] rounded-2xl p-5 sm:p-7 lg:p-8 shadow-[0_4px_20px_rgba(44,42,41,0.02)] hover:shadow-[0_8px_30px_rgba(44,42,41,0.05)] hover:border-[#D5C9B8] transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Category Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F3EFEA] border border-[#E3D9CC] text-[10px] font-mono text-[#665E56] uppercase tracking-wider font-semibold">
            <Tag className="w-3 h-3 text-[#7C7775]" />
            {poem.category}
          </span>
          <span className="text-[11px] font-mono text-[#8C827A] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {poem.readTime}
          </span>
        </div>

        {/* Article Title */}
        <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl text-[#1F1E1D] font-medium tracking-tight mb-4 group-hover:text-[#4A423A] transition-colors leading-snug">
          {poem.title}
        </h2>

        {/* Central Content Box */}
        <div className="relative my-4 p-5 sm:p-6 rounded-xl bg-[#F6F2EC] border border-[#E5DCD0] border-l-4 border-l-[#2C2A29] shadow-inner">
          <blockquote className="font-serif text-base sm:text-lg leading-relaxed text-[#2C2A29] whitespace-pre-line italic">
            &ldquo;{poem.stanza}&rdquo;
          </blockquote>
        </div>
      </div>

      {/* Metadata & Actions */}
      <div className="mt-6 pt-4 border-t border-[#E3D9CC] space-y-4">
        {/* Structured Author & Date Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#665E56] font-serif">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#8C827A] shrink-0" />
            <span className="truncate">Written By: <strong className="font-semibold text-[#2C2A29]">{poem.author.name}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#8C827A] shrink-0" />
            <span className="truncate">Written On: {poem.publishedAt}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[#8C827A] shrink-0" />
            <span className="truncate">Last Updated: {poem.updatedAt}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 min-h-[44px] min-w-[44px] text-xs text-[#665E56] hover:text-[#8C3A32] active:scale-95 transition-all">
              <Heart className="w-4 h-4" />
              <span>{poem.likes}</span>
            </button>
            <button className="flex items-center gap-1.5 min-h-[44px] min-w-[44px] text-xs text-[#665E56] hover:text-[#2C2A29] active:scale-95 transition-all">
              <MessageSquare className="w-4 h-4" />
              <span>{poem.comments}</span>
            </button>
            {poem.hasAudio && (
              <button className="flex items-center gap-1 min-h-[44px] px-3 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs hover:bg-[#3D3732] active:scale-95 transition-all">
                <Play className="w-3 h-3 fill-current" />
                <span>Listen</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#665E56] hover:text-[#2C2A29] active:scale-95 transition-all" title="Save Article">
              <Bookmark className="w-4 h-4" />
            </button>
            <button className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#665E56] hover:text-[#2C2A29] active:scale-95 transition-all" title="Share Article">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}