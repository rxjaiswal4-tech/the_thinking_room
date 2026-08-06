"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Feather,
  BookOpen,
  Info,
  Sparkles,
  ArrowRight,
  Clock,
  User,
  Heart,
  Bookmark,
  Share2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface ContentItem {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  type: "poetry" | "stories" | "information";
  readTime?: string;
  likes?: number;
}

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"all" | "poetry" | "stories" | "information">("all");
  const [trendingContent, setTrendingContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLandingContent() {
      // Fetch dynamic poetry content from Supabase
      const { data, error } = await supabase
        .from("poems")
        .select(`
          id,
          title,
          stanza,
          created_at,
          likes,
          authors ( name )
        `)
        .order("created_at", { ascending: false })
        .limit(6);

      let fetchedPoems: ContentItem[] = [];

      if (!error && data) {
        fetchedPoems = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.stanza,
          author: item.authors?.name || "Anonymous Poet",
          date: new Date(item.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          type: "poetry",
          readTime: "2 min read",
          likes: item.likes || 0,
        }));
      }

      // Sample fallback/supplemental curated stories and informative literary content
      const supplementalContent: ContentItem[] = [
        {
          id: "story-1",
          title: "The Clockmaker’s Last Reflection",
          content:
            "In the quiet alleyways of Prague, an aging craftsman carved minutes out of brass. He believed that time wasn't stolen by age, but given away in small, unremembered acts of love...",
          author: "Julian Vance",
          date: "Aug 4, 2026",
          type: "stories",
          readTime: "5 min read",
          likes: 142,
        },
        {
          id: "info-1",
          title: "The Architecture of Modern Meter",
          content:
            "Free verse is not the absence of structure; it is the freedom to discover organic rhythm. Learn how modern poets blend cadence, lineation, and silence to craft resonant imagery...",
          author: "Dr. Evelyn Wright",
          date: "Aug 2, 2026",
          type: "information",
          readTime: "4 min read",
          likes: 98,
        },
      ];

      setTrendingContent([...fetchedPoems, ...supplementalContent]);
      setLoading(false);
    }

    fetchLandingContent();
  }, []);

  const filteredItems =
    activeTab === "all"
      ? trendingContent
      : trendingContent.filter((item) => item.type === activeTab);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2A29] relative overflow-x-hidden font-serif selection:bg-[#E8E2D9]">
      {/* Paper Grain Texture Background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035] z-50 mix-blend-multiply"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 sm:space-y-24">
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative text-center max-w-3xl mx-auto space-y-6 pt-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EFEA] border border-[#E3D9CC] text-xs font-mono uppercase tracking-widest text-[#7C7775]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8C3A32]" />
            <span>A Sanctuary for the Written Word</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-normal text-[#1F1E1D] tracking-tight leading-tight sm:leading-tight"
          >
            Where thoughts pause, <br />
            <span className="italic font-light text-[#8C3A32]">and words resonate.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg text-[#5A5654] leading-relaxed max-w-2xl mx-auto font-sans font-light"
          >
            Welcome to a quiet digital atelier curated for poets, storytellers, and thinkers. 
            Explore original verse, deep narrative prose, and insightful literary essays gathered in one unified hearth.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/feed"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-sans font-medium uppercase tracking-wider hover:bg-[#3D3732] transition-all shadow-sm"
            >
              <span>Explore Content</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/share"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F3EFEA] border border-[#E3D9CC] text-[#2C2A29] text-xs font-sans font-medium uppercase tracking-wider hover:bg-[#E8E2D9] transition-all"
            >
              <span>Publish Verse</span>
            </Link>
          </motion.div>
        </section>

        {/* ================= TRENDING / FEATURED SECTION ================= */}
        <section id="trending-section" className="space-y-8">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#E3D9CC] pb-4 gap-4">
            <div>
              <h2 className="text-2xl font-serif text-[#1F1E1D] font-normal">
                Latest & Trending Works
              </h2>
              <p className="text-xs font-sans text-[#7C7775]">
                Curated pieces across verse, story, and literature.
              </p>
            </div>

            {/* TAB CONTROLS: Poetry | Stories | Information */}
            <div className="flex items-center gap-1 sm:gap-2 p-1 rounded-full bg-[#F3EFEA] border border-[#E3D9CC]">
              {[
                { id: "all", label: "All Works" },
                { id: "poetry", label: "Poetry", icon: Feather },
                { id: "stories", label: "Stories", icon: BookOpen },
                { id: "information", label: "Information", icon: Info },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-sans transition-all ${
                      activeTab === tab.id
                        ? "bg-[#2C2A29] text-[#FAF8F5] shadow-sm"
                        : "text-[#665E56] hover:text-[#2C2A29]"
                    }`}
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Grid */}
          {loading ? (
            <div className="text-center py-20 font-serif text-[#7C7775] italic">
              Gathering latest literary works...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 font-serif text-[#7C7775] italic">
              No entries found under this section yet.
            </div>
          ) : (
            <motion.div
              layout
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <motion.article
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    key={item.id}
                    className="group bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(44,42,41,0.02)] hover:shadow-[0_8px_30px_rgba(44,42,41,0.06)] hover:border-[#D5C9B8] transition-all flex flex-col justify-between"
                  >
                    {/* TOP: Title & Badge */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F3EFEA] border border-[#E3D9CC] text-[9px] font-mono uppercase tracking-widest text-[#7C7775]">
                          {item.type}
                        </span>
                        {item.readTime && (
                          <span className="text-[10px] font-sans text-[#8C827A]">
                            {item.readTime}
                          </span>
                        )}
                      </div>

                      {/* TITLE AT TOP */}
                      <h3 className="font-serif text-xl text-[#1F1E1D] font-normal tracking-tight mb-4 group-hover:text-[#8C3A32] transition-colors">
                        {item.title}
                      </h3>

                      {/* MAIN CONTENT / EXCERPT */}
                      <p className="font-serif text-sm leading-relaxed text-[#4A423A] italic whitespace-pre-line mb-8 border-l-2 border-[#E8E2D9] pl-3">
                        {item.content}
                      </p>
                    </div>

                    {/* BOTTOM: Writer Name & Uploaded Date */}
                    <div className="pt-4 border-t border-[#E3D9CC]/70 space-y-3">
                      {/* WRITER NAME AT BOTTOM */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#E8E2D9] flex items-center justify-center text-[#2C2A29]">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-serif text-xs font-semibold text-[#2C2A29]">
                            {item.author}
                          </span>
                        </div>

                        {/* Action Icons */}
                        <div className="flex items-center gap-2 text-[#7C7775]">
                          <button title="Like" className="hover:text-[#8C3A32] transition-colors p-1">
                            <Heart className="w-3.5 h-3.5" />
                          </button>
                          <button title="Bookmark" className="hover:text-[#2C2A29] transition-colors p-1">
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                          <button title="Share" className="hover:text-[#2C2A29] transition-colors p-1">
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* UPLOADED DATE AT VERY BOTTOM */}
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8C827A]">
                        <Clock className="w-3 h-3" />
                        <span>Uploaded on {item.date}</span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        

      </div>
    </div>
  );
}