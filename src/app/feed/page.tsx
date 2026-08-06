"use client";

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

export default function FeedPage() {
  return (
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
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#F3F0EA] text-[#665E56] transition-colors border border-transparent hover:border-[#E8E4DC]">
                <Share2 className="w-3.5 h-3.5" />
                <span className="text-xs font-serif">Share</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}