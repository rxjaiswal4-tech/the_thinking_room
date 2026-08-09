"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Calendar,
  User,
  Share2,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Navigation } from "./components/Navigation";

interface Poem {
  id: string;
  title: string;
  body: string;
  author: string;
  category: string;
  created_at: string;
  updated_at?: string;
}

function LandingContent() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for tracking selected poem in popup
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);

  useEffect(() => {
    async function fetchLatestLandingPoems() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("poems")
          .select("*")
          .order("updated_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) {
          console.error("Error fetching landing poems:", error);
        } else if (data) {
          setPoems(data as Poem[]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLatestLandingPoems();
  }, []);

  // Prevent background scrolling when popup is active
  useEffect(() => {
    if (selectedPoem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedPoem]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2A29] relative font-serif selection:bg-[#E8E2D9]">
      {/* Sidebar & Top Header Navigation */}
      <Navigation onCollapseChange={(collapsed) => setIsCollapsed(collapsed)} />

      {/* Main Page Container */}
      <div
        className={`w-full min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-14 pb-16 space-y-16">
          
          {/* ================= HERO SECTION ================= */}
          <section className="relative text-center max-w-3xl mx-auto space-y-5 pt-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EFEA] border border-[#E3D9CC] text-xs font-mono uppercase tracking-widest text-[#7C7775]"
            >
              <Sparkles className="w-3 h-3 text-[#8C3A32]" />
              <span>A Sanctuary for the Written Word</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-6xl font-normal text-[#1F1E1D] tracking-tight leading-tight sm:leading-tight"
            >
              Where thoughts pause, <br />
              <span className="italic font-light text-[#8C3A32]">
                and words resonate.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="-mt-1 text-sm sm:text-base text-[#5A5654] leading-relaxed max-w-1xl mx-auto font-sans font-light"
            >
              Welcome to a quiet digital atelier curated for poets, storytellers,
              and thinkers. Explore original verse, deep narrative prose, and
              insightful literary essays gathered in one unified hearth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex items-center justify-center gap-4 pt-2"
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

          {/* ================= LATEST WORKS (COMPACT CARDS) ================= */}
          <section className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#E3D9CC] pb-4">
              <div>
                <h2 className="text-xl font-serif text-[#1F1E1D] font-medium">
                  Latest Works
                </h2>
                <p className="text-xs font-sans text-[#7C7775]">
                  The 3 most recently updated pieces.
                </p>
              </div>

              <Link
                href="/feed"
                className="text-xs font-serif text-[#8C3A32] hover:underline flex items-center gap-1"
              >
                View all feed <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Small Cards Grid */}
            {loading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-[#FAFAFA] border border-[#EAE8E4] animate-pulse h-48 flex flex-col justify-between"
                  >
                    <div className="h-4 w-1/3 bg-[#EAE5DC] rounded" />
                    <div className="h-6 w-3/4 bg-[#EAE5DC] rounded" />
                    <div className="h-10 w-full bg-[#F6F4EF] rounded" />
                  </div>
                ))}
              </div>
            ) : poems.length === 0 ? (
              <div className="text-center p-8 rounded-2xl bg-[#FAFAFA] border border-[#EAE8E4] font-serif text-xs text-[#786F66]">
                No poems published yet.
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {poems.map((poem) => (
                  <article
                    key={poem.id}
                    onClick={() => setSelectedPoem(poem)}
                    className="p-6 rounded-2xl bg-[#FAFAFA] border border-[#EAE8E4] shadow-sm flex flex-col justify-between gap-4 hover:border-[#DCD7CE] hover:shadow-md transition-all group cursor-pointer"
                  >
                    {/* Header: Category & Share */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-serif text-[#786F66]">
                        <span className="italic">{poem.category || "General"}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(window.location.href);
                          }} 
                          className="text-[#8C827A] hover:text-[#2C2723] transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h3 className="font-serif text-lg font-medium text-[#2C2723] line-clamp-2 group-hover:text-[#8C3A32] transition-colors">
                        {poem.title}
                      </h3>
                    </div>

                    {/* Excerpt Body (Truncated to 3 lines) */}
                    <p className="font-serif text-xs text-[#5A5654] leading-relaxed italic line-clamp-3">
                      "{poem.body}"
                    </p>

                    {/* Footer Meta */}
                    <div className="pt-3 border-t border-[#F0ECE4] text-[11px] text-[#786F66] font-serif flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[#2C2723] font-medium">
                        <User className="w-3 h-3 text-[#8C827A]" />
                        <span className="truncate">{poem.author || "Anonymous"}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[#8C827A] font-mono text-[10px]">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(poem.updated_at || poem.created_at)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>

      {/* ================= WORK DETAIL POPUP MODAL ================= */}
      <AnimatePresence>
        {selectedPoem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPoem(null)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-2xl max-h-[85vh] bg-[#FAF7F2] border border-[#E3D9CC] rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
            >
              {/* Top Header Controls */}
              <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-[#E3D9CC]/60 bg-[#FAF7F2]/90 sticky top-0 backdrop-blur-md z-20">
                <span className="text-xs font-mono uppercase tracking-widest text-[#8C3A32]">
                  {selectedPoem.category || "General"}
                </span>

                <button
                  onClick={() => setSelectedPoem(null)}
                  className="p-1.5 rounded-full bg-[#F3EFEA] border border-[#E3D9CC] text-[#5A5654] hover:text-[#1F1E1D] hover:bg-[#E8E2D9] transition-all"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-6 sm:p-10 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#1F1E1D] leading-tight">
                    {selectedPoem.title}
                  </h2>
                  <div className="flex items-center gap-4 text-xs font-serif text-[#7C7775]">
                    <span className="flex items-center gap-1 text-[#2C2723]">
                      <User className="w-3.5 h-3.5 text-[#8C3A32]" />
                      {selectedPoem.author || "Anonymous"}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">
                      {formatDate(selectedPoem.updated_at || selectedPoem.created_at)}
                    </span>
                  </div>
                </div>

                {/* Stanza Text (Preserves spacing & wraps correctly) */}
                <div className="pt-2 border-t border-[#E3D9CC]/40">
                  <p className="font-serif text-base sm:text-lg text-[#2C2A29] leading-relaxed whitespace-pre-wrap italic">
                    {selectedPoem.body}
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 sm:px-8 py-4 border-t border-[#E3D9CC]/60 bg-[#F3EFEA]/50 flex items-center justify-between text-xs font-sans text-[#7C7775]">
                <span>Stanza Platform</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                  }}
                  className="inline-flex items-center gap-1.5 text-[#8C3A32] hover:underline"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Piece
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2]" />}>
      <LandingContent />
    </Suspense>
  );
}