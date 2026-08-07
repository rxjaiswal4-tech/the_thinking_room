"use client";

import React, { useEffect, useState } from "react";
import { Share2, Sparkles, Clock, Calendar, User } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

interface Stanza {
  id: string;
  title: string;
  body: string;
  author: string;
  category: string;
  created_at: string;
  updated_at?: string;
}

const fallbackStanzas: Stanza[] = [
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

export default function FeedPage() {
  const [stanzas, setStanzas] = useState<Stanza[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStanzas() {
      if (!supabase) {
        setStanzas(fallbackStanzas);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("stanzas")
          .select("*")
          .order("created_at", { ascending: false });

        if (error || !data || data.length === 0) {
          setStanzas(fallbackStanzas);
        } else {
          setStanzas(data as Stanza[]);
        }
      } catch (err) {
        console.error("Error fetching stanzas:", err);
        setStanzas(fallbackStanzas);
      } finally {
        setLoading(false);
      }
    }

    fetchStanzas();
  }, []);

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
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:px-8 flex flex-col gap-10">
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
        ) : (
          stanzas.map((stanza) => (
            <article
              key={stanza.id}
              className="p-8 sm:p-12 rounded-3xl bg-[#FAFAFA] border border-[#EAE8E4] shadow-sm flex flex-col items-center text-center gap-6 hover:border-[#DCD7CE] transition-colors"
            >
              {/* Category */}
              <span className="text-xs sm:text-sm font-serif italic tracking-wide text-[#786F66]">
                {stanza.category || "General"}
              </span>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#2C2723] max-w-2xl">
                {stanza.title}
              </h2>

              {/* Article Content */}
              <div className="w-full max-w-3xl my-2 py-4">
                <p className="font-serif text-base sm:text-lg text-[#38332E] leading-relaxed whitespace-pre-line italic">
                  {stanza.body}
                </p>
              </div>

              {/* Restored Footer Layout */}
              <div className="w-full flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 pt-6 border-t border-[#F0ECE4] text-xs text-[#786F66] font-serif">
                <div className="flex flex-col items-center sm:items-start gap-1 text-left">
                  <div className="flex items-center gap-1.5 text-[#2C2723] font-medium">
                    <User className="w-3.5 h-3.5 text-[#8C827A]" />
                    <span>Written By: {stanza.author || "Anonymous"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#8C827A] text-[11px] font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>Written On: {formatDate(stanza.created_at)}</span>
                  </div>
                  {stanza.updated_at && (
                    <div className="flex items-center gap-1.5 text-[#8C827A] text-[11px] font-mono">
                      <Clock className="w-3 h-3" />
                      <span>
                        Last Updated: {formatDate(stanza.updated_at)}
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