"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Share2, Sparkles, Clock, Calendar, User, Search, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { HighlightText } from "../components/HighlightsText";
// Initialize Supabase client safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

interface Poem {
  id: string;
  title: string;
  body: string;
  author: string;
  category: string;
  created_at: string;
  updated_at?: string;
}

const fallbackPoems: Poem[] = [
  {
    id: "1",
    category: "Philosophy",
    title: "The Importance of Critical Thinking",
    body: "Critical thinking is the intellect's compass through uncertainty. It demands that we scrutinize assumptions, measure evidence without bias, and embrace truth over comfort.",
    author: "John Doe",
    created_at: "2026-08-05T00:00:00Z",
    updated_at: "2026-08-06T00:00:00Z",
  },
];

function FeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPoems = async () => {
    setLoading(true);

    if (!supabase) {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        setPoems(
          fallbackPoems.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.body.toLowerCase().includes(q) ||
              p.author.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q)
          )
        );
      } else {
        setPoems(fallbackPoems);
      }
      setLoading(false);
      return;
    }

    try {
      let queryBuilder = supabase
        .from("poems")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply multi-column search filter if query parameter exists
      if (searchQuery.trim()) {
        const term = `%${searchQuery.trim()}%`;
        queryBuilder = queryBuilder.or(
          `title.ilike.${term},body.ilike.${term},author.ilike.${term},category.ilike.${term}`
        );
      }

      const { data, error } = await queryBuilder;

      if (error) {
        console.error("Supabase Error:", error);
        setPoems(fallbackPoems);
      } else if (!data || data.length === 0) {
        setPoems([]);
      } else {
        setPoems(data as Poem[]);
      }
    } catch (err) {
      console.error("Error fetching poems:", err);
      setPoems(fallbackPoems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoems();
  }, [searchQuery]);

  const handleClearSearch = () => {
    router.push("/feed");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:px-8 flex flex-col gap-8">
      {/* Feed Header */}
      <header className="text-center space-y-2 py-2">
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

      {/* Active Search Banner */}
      {searchQuery && (
        <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-[#F4F0E9] border border-[#E4DDD3]">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-serif text-[#2C2723]">
            <Search className="w-4 h-4 text-[#8C827A]" />
            <span>
              Showing results for:{" "}
              <strong className="font-medium italic text-[#1A1816]">
                "{searchQuery}"
              </strong>
            </span>
            {!loading && (
              <span className="text-xs text-[#8C827A] font-mono ml-1">
                ({poems.length} {poems.length === 1 ? "result" : "results"})
              </span>
            )}
          </div>
          <button
            onClick={handleClearSearch}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-serif text-[#786F66] hover:text-[#2C2723] rounded-lg hover:bg-[#EAE4DA] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear search</span>
          </button>
        </div>
      )}

      {/* Feed List */}
      <div className="flex flex-col gap-10">
        {loading ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-[#FAFAFA] border border-[#EAE8E4] animate-pulse flex flex-col items-center gap-6">
            <div className="h-4 w-28 bg-[#EAE5DC] rounded" />
            <div className="h-7 w-3/4 bg-[#EAE5DC] rounded" />
            <div className="w-full h-24 bg-[#F6F4EF] rounded-xl" />
            <div className="w-full space-y-2 pt-4">
              <div className="h-3 w-1/3 bg-[#EAE5DC] rounded" />
              <div className="h-3 w-1/4 bg-[#EAE5DC] rounded" />
            </div>
          </div>
        ) : poems.length === 0 ? (
          <div className="text-center p-12 rounded-3xl bg-[#FAFAFA] border border-[#EAE8E4] flex flex-col items-center gap-3">
            <Search className="w-8 h-8 text-[#B0A69A]" />
            <p className="font-serif text-[#2C2723] text-base sm:text-lg">
              {searchQuery
                ? `No matches found for "${searchQuery}"`
                : "No poems published yet."}
            </p>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="mt-2 text-xs font-serif text-[#8C827A] underline underline-offset-4 hover:text-[#2C2723]"
              >
                Clear query to view all posts
              </button>
            )}
          </div>
        ) : (
          poems.map((poem) => (
            <article
              key={poem.id}
              className="p-8 sm:p-12 rounded-3xl bg-[#FAFAFA] border border-[#EAE8E4] shadow-sm flex flex-col items-center text-center gap-6 hover:border-[#DCD7CE] transition-colors"
            >
              {/* Category */}
              <span className="text-xs sm:text-sm font-serif italic tracking-wide text-[#786F66]">
                {poem.category || "General"}
              </span>

             
              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#2C2723] max-w-2xl">
                <HighlightText text={poem.title} query={searchQuery} />
              </h2>

              {/* Article Content */}
              <div className="w-full max-w-3xl my-2 py-4">
                <p className="font-serif text-base sm:text-lg text-[#38332E] leading-relaxed whitespace-pre-line italic">
                  <HighlightText text={poem.body} query={searchQuery} />
                </p>
              </div>

              {/* Footer Layout */}
              <div className="w-full flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 pt-6 border-t border-[#F0ECE4] text-xs text-[#786F66] font-serif">
                <div className="flex flex-col items-center sm:items-start gap-1 text-left">
                  <div className="flex items-center gap-1.5 text-[#2C2723] font-medium">
                    <User className="w-3.5 h-3.5 text-[#8C827A]" />
                    <span>Written By: {poem.author || "Anonymous"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#8C827A] text-[11px] font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>Written On: {formatDate(poem.created_at)}</span>
                  </div>
                  {poem.updated_at && (
                    <div className="flex items-center gap-1.5 text-[#8C827A] text-[11px] font-mono">
                      <Clock className="w-3 h-3" />
                      <span>
                        Last Updated: {formatDate(poem.updated_at)}
                      </span>
                    </div>
                  )}
                </div>

                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:bg-[#F3F0EA] text-[#665E56] transition-colors border border-transparent hover:border-[#E8E4DC] shrink-0">
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="text-xs font-serif">Share</span>
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-serif text-[#786F66]">Loading feed...</div>}>
      <FeedContent />
    </Suspense>
  );
}