"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { HighlightText } from "./HighlightsText";
// Safe initialization of Supabase client outside component scope
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  placeholder = "Search feed...",
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Sync state with URL parameter changes (e.g. when cleared from feed banner)
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Global '/' keyboard shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search for keyword suggestions across multiple fields
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || !supabase) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);

      try {
        const term = `%${trimmed}%`;
        const { data, error } = await supabase
          .from("poems")
          .select("title, author, category")
          .or(
            `title.ilike.${term},author.ilike.${term},category.ilike.${term}`
          )
          .limit(5);

        if (!error && data) {
          // Extract unique title matches or attributes
          const matches = Array.from(
            new Set(
              data.map(
                (item) => item.title || item.author || item.category
              )
            )
          );
          setSuggestions(matches);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Search error:", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsOpen(false);
    router.push(`/feed?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    // If we're currently on the feed page with an active search parameter, clear the query from URL
    if (searchParams.get("q")) {
      router.push("/feed");
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit(query);
        }}
        className="relative flex items-center"
      >
        <Search className="absolute left-3.5 w-4 h-4 text-[#8C827A] pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-[#F3EFEA]/80 border border-[#E3D9CC] rounded-full text-[#2C2A29] placeholder-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#2C2A29]"
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 w-4 h-4 text-[#8C827A] animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-0.5 text-[#8C827A] hover:text-[#2C2A29]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="absolute right-3 hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[#8C827A] bg-[#E8E2D9]/60 border border-[#D8D2C6] rounded pointer-events-none">
            /
          </kbd>
        )}
      </form>

      {/* Suggestion Popover */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#FAF8F5] border border-[#E3D9CC] rounded-2xl shadow-xl overflow-hidden z-50 p-1.5">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#8C827A]">
            Suggestions
          </div>
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(suggestion);
                handleSearchSubmit(suggestion);
              }}
              className="w-full text-left px-3 py-2 text-xs font-serif text-[#2C2723] hover:bg-[#F3EFEA] rounded-xl flex items-center gap-2 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-[#8C827A] shrink-0" />
              <span className="truncate">
                <HighlightText text={suggestion} query={query} />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}