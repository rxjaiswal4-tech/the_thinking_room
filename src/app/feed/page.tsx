"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Share2, Clock, User, Search, X, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { HighlightText } from "../components/HighlightsText";

interface Poem {
  id: string;
  title: string;
  body: string;
  author: string;
  category: string;
  language?: string;
  tags?: string[];
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
    tags: ["Philosophy", "Life", "Wisdom"],
    created_at: "2026-08-05T00:00:00Z",
    updated_at: "2026-08-06T00:00:00Z",
  },
];

const categoryTagsFallback: Record<string, string[]> = {
  philosophy: ["Philosophy", "Life", "Wisdom"],
  "free verse": ["FreeVerse", "Poetry", "Soul"],
  reflections: ["Reflections", "Memory", "Mind"],
  "nature & sea": ["Nature", "Sea", "Beauty"],
  sonnets: ["Sonnets", "Love", "Classical"],
  elegies: ["Elegies", "Grief", "Memory"],
  "urban life": ["Urban", "Society", "Modern"],
  nocturne: ["Nocturne", "Night", "Dreams"],
};

/* -------------------------------------------------------------------------- */
/*                          Background Art & Decor                             */
/* -------------------------------------------------------------------------- */

function BackgroundArt() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0">
      {/* 1. Intense Sun Core */}
      <div className="absolute top-[22%] left-[8%] sm:left-[14%] w-[160px] sm:w-[240px] h-[160px] sm:h-[240px] bg-amber-100 rounded-full blur-2xl opacity-90 mix-blend-screen" />

      {/* 2. Soft Golden Atmospheric Ambiance */}
      <div className="absolute top-[8%] left-[-2%] w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-amber-200/50 rounded-full blur-3xl mix-blend-soft-light" />

      {/* 3. Rim Light Glow on Card Edge */}
      <div className="absolute top-[18%] left-[28%] w-[180px] h-[300px] bg-amber-100/30 rounded-full blur-3xl" />

      {/* Tree WebP Image */}
      <div className="absolute bottom-0 left-0 w-[220px] sm:w-[380px] md:w-[480px] lg:w-[560px] h-auto opacity-[0.22] mix-blend-multiply transition-all">
        <img
          src="/tree.webp"
          alt=""
          aria-hidden="true"
          className="w-full h-auto object-contain object-bottom select-none"
        />
      </div>

      {/* Birds Silhouette Flying Accent */}
      <svg
        className="absolute top-20 sm:top-14 left-[52%] sm:left-[42%] md:left-[46%] w-24 sm:w-32 md:w-40 h-auto text-[#2C2723] opacity-25 z-10 pointer-events-none transition-all"
        viewBox="0 0 200 120"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M30,40 Q45,20 60,35 Q75,20 90,40 Q75,32 60,42 Q45,32 30,40 Z" />
        <path d="M100,20 Q112,5 125,16 Q137,5 150,20 Q137,13 125,22 Q112,13 100,20 Z" />
        <path d="M145,50 Q153,38 162,47 Q171,38 180,50 Q171,44 162,51 Q153,44 145,50 Z" />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Feed Content                                */
/* -------------------------------------------------------------------------- */

function FeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPoems = async () => {
    setLoading(true);

    if (!supabase) {
      if (searchQuery) {
        const q = searchQuery.toLowerCase().replace(/^#/, "");
        setPoems(
          fallbackPoems.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.body.toLowerCase().includes(q) ||
              p.author.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q) ||
              p.tags?.some((t) => t.toLowerCase().includes(q))
          )
        );
      } else {
        setPoems(fallbackPoems);
      }
      setLoading(false);
      return;
    }

    try {
      let queryBuilder = supabase.from("poems").select("*");

      const cleanQuery = searchQuery.trim().toLowerCase().replace(/^#/, "");
      if (cleanQuery) {
        const term = `%${cleanQuery}%`;
        queryBuilder = queryBuilder.or(
          `title.ilike.${term},body.ilike.${term},author.ilike.${term},category.ilike.${term}`
        );
      }

      const { data, error } = await queryBuilder.order("created_at", { ascending: false });

      let basePoems: any[] = [];
      if (error) {
        const fallback = await queryBuilder;
        if (fallback.error) {
          console.error("Supabase Error:", fallback.error);
          basePoems = fallbackPoems;
        } else {
          basePoems = fallback.data || [];
        }
      } else {
        basePoems = data || [];
      }

      // Fetch relational tags from submission_tags junction table
      const tagsByPoemId: Record<string, string[]> = {};
      try {
        const { data: stData } = await supabase
          .from("submission_tags")
          .select("submission_id, tag:tags(name, slug)");

        if (stData) {
          stData.forEach((row: any) => {
            const tagName = row.tag?.name;
            if (row.submission_id && tagName) {
              if (!tagsByPoemId[row.submission_id]) {
                tagsByPoemId[row.submission_id] = [];
              }
              if (!tagsByPoemId[row.submission_id].includes(tagName)) {
                tagsByPoemId[row.submission_id].push(tagName);
              }
            }
          });
        }
      } catch (stErr) {
        console.warn("Could not query submission_tags in feed:", stErr);
      }

      // Resolve tags for each poem
      let resolvedPoems: Poem[] = basePoems.map((p: any) => {
        let tags: string[] = [];
        if (Array.isArray(p.tags) && p.tags.length > 0) {
          tags = p.tags;
        } else if (typeof p.tags === "string" && p.tags.trim()) {
          tags = p.tags
            .split(",")
            .map((t: string) => t.trim().replace(/^#/, ""))
            .filter(Boolean);
        } else if (tagsByPoemId[p.id] && tagsByPoemId[p.id].length > 0) {
          tags = tagsByPoemId[p.id];
        } else {
          const catKey = (p.category || "").toLowerCase().trim();
          tags = categoryTagsFallback[catKey] || [p.category || "Poetry", "Anthology"];
        }

        return {
          ...p,
          tags,
        };
      });

      // Filter by tag if user searched with tag or general search
      if (cleanQuery) {
        resolvedPoems = resolvedPoems.filter((p) => {
          const inTitle = p.title.toLowerCase().includes(cleanQuery);
          const inBody = p.body.toLowerCase().includes(cleanQuery);
          const inAuthor = p.author.toLowerCase().includes(cleanQuery);
          const inCat = p.category.toLowerCase().includes(cleanQuery);
          const inTags = p.tags?.some((t) => t.toLowerCase().includes(cleanQuery));
          return inTitle || inBody || inAuthor || inCat || inTags;
        });
      }

      setPoems(resolvedPoems);
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

  const handleShare = async (poem: Poem) => {
    const shareUrl = `${window.location.origin}/feed?id=${poem.id}`;
    const shareData = {
      title: poem.title,
      text: `Read "${poem.title}" by ${poem.author || "Anonymous"} on Poetic Stream`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing content:", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedId(poem.id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-16 space-y-12 relative z-10">
      {/* Header Accent */}
      <header className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2EFE9] border border-[#E5E0D8] text-[11px] font-mono tracking-widest uppercase text-[#8C827A]">
          Anthology Feed
        </span>
        <h1 className="text-3xl sm:text-4xl italic text-[#2C2723] font-serif">
          Poetic Stream
        </h1>
        <p className="text-xs sm:text-sm text-[#786F66] italic font-serif">
          A synchronized river of contemplative thought, verse, and quiet observation.
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
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-serif text-[#786F66] hover:text-[#2C2723] rounded-lg hover:bg-[#EAE4DA] transition-colors cursor-pointer"
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
                className="mt-2 text-xs font-serif text-[#8C827A] underline underline-offset-4 hover:text-[#2C2723] cursor-pointer"
              >
                Clear query to view all posts
              </button>
            )}
          </div>
        ) : (
          poems.map((poem) => (
            <article
              key={poem.id}
              className="p-8 sm:p-12 rounded-3xl bg-[#F6F4EB]/90 backdrop-blur-sm border border-[#EAE8E4] shadow-sm flex flex-col items-center text-center gap-6 hover:border-[#DCD7CE] transition-colors"
            >
              {/* Category */}
              <span className="text-xs sm:text-sm font-serif italic tracking-wide text-[#786F66]">
                {poem.category || "General"}
              </span>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#2C2723] max-w-2xl">
                <HighlightText text={poem.title} query={searchQuery} />
              </h2>

              {/* Article Content / Description */}
              <div className="w-full max-w-3xl my-2 py-4 space-y-4">
                <p className="font-serif text-base sm:text-lg text-[#38332E] leading-relaxed whitespace-pre-line italic">
                  <HighlightText text={poem.body} query={searchQuery} />
                </p>

                {/* YouTube-style description hashtags */}
                {poem.tags && poem.tags.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-[#EAE5DC]/60">
                    {poem.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => router.push(`/feed?q=${encodeURIComponent(tag)}`)}
                        className="inline-flex items-center text-xs sm:text-sm font-sans font-medium text-[#8C3A32] hover:text-[#5C241E] hover:underline transition-colors cursor-pointer"
                        title={`Filter feed by #${tag}`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Layout */}
              <div className="w-full flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 pt-6 border-t border-[#F0ECE4] text-xs text-[#786F66] font-serif">
                <div className="flex flex-col items-center sm:items-start gap-1 text-left">
                  <div className="flex items-center gap-1.5 text-[#2C2723] font-medium">
                    <User className="w-3.5 h-3.5 text-[#8C827A]" />
                    <span>Author: {poem.author || "Anonymous"}</span>
                  </div>
                  {poem.created_at && (
                    <div className="flex items-center gap-1.5 text-[#8C827A] text-[11px] font-mono">
                      <Clock className="w-3 h-3" />
                      <span>
                        Last Updated: {formatDate(poem.created_at)}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleShare(poem)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:bg-[#F3F0EA] text-[#665E56] transition-colors border border-transparent hover:border-[#E8E4DC] shrink-0 cursor-pointer"
                >
                  {copiedId === poem.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs font-serif text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="text-xs font-serif">Share</span>
                    </>
                  )}
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
    <div className="relative min-h-screen">
      {/* Background Decor */}
      <BackgroundArt />

      <Suspense
        fallback={
          <div className="p-12 text-center font-serif text-[#786F66] relative z-10">
            Loading feed...
          </div>
        }
      >
        <FeedContent />
      </Suspense>
    </div>
  );
}
