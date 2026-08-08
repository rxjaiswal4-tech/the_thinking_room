"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import CategoriesMenu from "../components/CategoriesMenu";
import { Navigation } from "../components/Navigation";
import { User, Calendar, Clock, Share2, Sparkles } from "lucide-react";

interface Poem {
  id: string;
  title: string;
  body: string;
  author: string;
  category: string;
  created_at: string;
  updated_at?: string;
}

export default function CategoriesPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFilteredPoems() {
      setLoading(true);

      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from("poems")
          .select("*")
          .order("updated_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false });

        if (selectedCategory) {
          // Case-insensitive filtering for selected category
          query = query.ilike("category", selectedCategory);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching filtered poems:", error);
        } else if (data) {
          setPoems(data as Poem[]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFilteredPoems();
  }, [selectedCategory]);

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
      <main
        className={`w-full min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-24 pb-16 space-y-12">
          
          {/* Categories Selector Component */}
          <section className="bg-[#FAF7F2]">
            <CategoriesMenu
              selectedCategory={selectedCategory}
              onSelectCategory={(category) => setSelectedCategory(category)}
            />
          </section>

          {/* Results Section */}
          <section className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-[#E3D9CC] pb-4">
              <h2 className="text-2xl font-serif text-[#1F1E1D] font-normal">
                {selectedCategory ? `${selectedCategory} Verses` : "All Collection"}
              </h2>
              <span className="text-xs font-mono text-[#7C7775]">
                {poems.length} {poems.length === 1 ? "result" : "results"}
              </span>
            </div>

            {/* Poems List */}
            {loading ? (
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-8 sm:p-12 rounded-3xl bg-[#FAFAFA] border border-[#EAE8E4] animate-pulse flex flex-col items-center gap-6"
                  >
                    <div className="h-4 w-28 bg-[#EAE5DC] rounded" />
                    <div className="h-7 w-3/4 bg-[#EAE5DC] rounded" />
                    <div className="w-full h-24 bg-[#F6F4EF] rounded-xl" />
                  </div>
                ))}
              </div>
            ) : poems.length === 0 ? (
              <div className="text-center p-12 rounded-3xl bg-[#FAFAFA] border border-[#EAE8E4] font-serif text-[#786F66]">
                <Sparkles className="w-6 h-6 mx-auto mb-3 text-[#8C827A]" />
                <p>No works found under "{selectedCategory || "All Categories"}".</p>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                {poems.map((poem) => (
                  <article
                    key={poem.id}
                    className="p-8 sm:p-12 rounded-3xl bg-[#FAFAFA] border border-[#EAE8E4] shadow-sm flex flex-col items-center text-center gap-6 hover:border-[#DCD7CE] transition-colors"
                  >
                    {/* Category Tag */}
                    <span className="text-xs sm:text-sm font-serif italic tracking-wide text-[#786F66]">
                      {poem.category || "General"}
                    </span>

                    {/* Title */}
                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#2C2723] max-w-2xl">
                      {poem.title}
                    </h2>

                    {/* Content */}
                    <div className="w-full max-w-3xl my-2 py-4">
                      <p className="font-serif text-base sm:text-lg text-[#38332E] leading-relaxed whitespace-pre-line italic">
                        {poem.body}
                      </p>
                    </div>

                    {/* Footer Info */}
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
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}