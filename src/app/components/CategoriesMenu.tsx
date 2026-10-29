"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, FolderOpen, BookOpen, Layers, Globe } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface CategoryCount {
  name: string;
  count: number;
}

interface LanguageCount {
  value: string;
  label: string;
  count: number;
}

const LANGUAGES: { value: string; label: string }[] = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "nepali", label: "Nepali" },
  { value: "urdu", label: "Urdu" },
];

interface CategoriesMenuProps {
  selectedCategory?: string | null;
  selectedLanguage?: string | null;
  onSelectCategory?: (category: string | null) => void;
  onSelectLanguage?: (language: string | null) => void;
}

export default function CategoriesMenu({
  selectedCategory = null,
  selectedLanguage = null,
  onSelectCategory,
  onSelectLanguage,
}: CategoriesMenuProps) {
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [languages, setLanguages] = useState<LanguageCount[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        // Fetch category and language from the poems table
        const { data, error } = await supabase
          .from("poems")
          .select("category, language");

        if (error) {
          console.error("Error fetching categories:", error);
          // Fallback: try without language column (in case migration not yet applied)
          const { data: fallback } = await supabase
            .from("poems")
            .select("category");
          if (fallback) {
            setTotalCount(fallback.length);
            const categoryMap: Record<string, number> = {};
            fallback.forEach((item) => {
              const raw = item.category?.trim();
              const key = raw
                ? raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
                : "General";
              categoryMap[key] = (categoryMap[key] || 0) + 1;
            });
            setCategories(
              Object.keys(categoryMap)
                .map((name) => ({ name, count: categoryMap[name] }))
                .sort((a, b) => b.count - a.count)
            );
            // Show all 4 languages with 0 count when column missing
            setLanguages(LANGUAGES.map((l) => ({ ...l, count: 0 })));
          }
        } else if (data) {
          setTotalCount(data.length);

          const categoryMap: Record<string, number> = {};
          const languageMap: Record<string, number> = {};

          data.forEach((item) => {
            // Categories
            const rawCategory = item.category?.trim();
            if (rawCategory) {
              const formattedName =
                rawCategory.charAt(0).toUpperCase() +
                rawCategory.slice(1).toLowerCase();
              categoryMap[formattedName] =
                (categoryMap[formattedName] || 0) + 1;
            } else {
              categoryMap["General"] = (categoryMap["General"] || 0) + 1;
            }

            // Languages
            const rawLang = (item.language || "english").toLowerCase().trim();
            languageMap[rawLang] = (languageMap[rawLang] || 0) + 1;
          });

          const categoryList: CategoryCount[] = Object.keys(categoryMap)
            .map((name) => ({ name, count: categoryMap[name] }))
            .sort((a, b) => b.count - a.count);

          setCategories(categoryList);

          // All 4 languages always shown; count 0 if no poems yet
          setLanguages(
            LANGUAGES.map((lang) => ({
              value: lang.value,
              label: lang.label,
              count: languageMap[lang.value] || 0,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to aggregate categories:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:px-8 space-y-8 font-serif">
      {/* Header */}
      <div className="text-center space-y-2 py-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2EFE9] border border-[#E5E0D8] text-[11px] font-mono tracking-widest uppercase text-[#8C827A]">
          <Sparkles className="w-3 h-3 text-[#B0A69A]" />
          Themes &amp; Collections
        </span>
        <h1 className="text-3xl sm:text-4xl italic text-[#2C2723]">
          Explore Categories
        </h1>
        <p className="text-xs sm:text-sm text-[#786F66] italic font-sans font-light">
          Filter works according to the themes and genres in our collection.
        </p>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#EAE8E4] animate-pulse h-24 flex flex-col justify-between"
              >
                <div className="h-4 w-1/2 bg-[#EAE5DC] rounded" />
                <div className="h-3 w-1/3 bg-[#EAE5DC] rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── Content Categories ── */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* "All Works" Card */}
              <button
                onClick={() => {
                  onSelectCategory && onSelectCategory(null);
                  onSelectLanguage && onSelectLanguage(null);
                }}
                className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 group ${
                  selectedCategory === null && selectedLanguage === null
                    ? "bg-[#2C2A29] text-[#FAF8F5] border-[#2C2A29] shadow-md"
                    : "bg-[#FAFAFA] border-[#EAE8E4] text-[#2C2723] hover:border-[#DCD7CE] hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Layers
                    className={`w-5 h-5 ${
                      selectedCategory === null && selectedLanguage === null
                        ? "text-[#E8E2D9]"
                        : "text-[#8C827A] group-hover:text-[#8C3A32]"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      selectedCategory === null && selectedLanguage === null
                        ? "bg-[#3D3732] text-[#E8E2D9]"
                        : "bg-[#F3EFEA] text-[#7C7775]"
                    }`}
                  >
                    {totalCount} works
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-base leading-tight">
                    All Categories
                  </h3>
                  <p
                    className={`text-[11px] font-sans mt-0.5 ${
                      selectedCategory === null && selectedLanguage === null
                        ? "text-[#B0A69A]"
                        : "text-[#8C827A]"
                    }`}
                  >
                    Entire collection
                  </p>
                </div>
              </button>

              {/* Dynamic Supabase Categories */}
              {categories.map((cat) => {
                const isSelected =
                  selectedCategory?.toLowerCase() === cat.name.toLowerCase() &&
                  selectedLanguage === null;

                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      // Fire only onSelectCategory — page handler clears selectedLanguage
                      onSelectCategory && onSelectCategory(cat.name);
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 group ${
                      isSelected
                        ? "bg-[#2C2A29] text-[#FAF8F5] border-[#2C2A29] shadow-md"
                        : "bg-[#FAFAFA] border-[#EAE8E4] text-[#2C2723] hover:border-[#DCD7CE] hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <BookOpen
                        className={`w-5 h-5 ${
                          isSelected
                            ? "text-[#E8E2D9]"
                            : "text-[#8C827A] group-hover:text-[#8C3A32]"
                        }`}
                      />
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-[#3D3732] text-[#E8E2D9]"
                            : "bg-[#F3EFEA] text-[#7C7775]"
                        }`}
                      >
                        {cat.count} {cat.count === 1 ? "work" : "works"}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-medium text-base leading-tight">
                        {cat.name}
                      </h3>
                      <p
                        className={`text-[11px] font-sans mt-0.5 ${
                          isSelected ? "text-[#B0A69A]" : "text-[#8C827A]"
                        }`}
                      >
                        Browse {cat.name.toLowerCase()}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-12 bg-[#FAFAFA] rounded-2xl border border-[#EAE8E4] text-[#786F66] text-sm">
                <FolderOpen className="w-6 h-6 mx-auto mb-2 text-[#8C827A]" />
                No categories found in the database yet.
              </div>
            )}
          </div>

          {/* ── Languages Section ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E8E4DC]" />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2EFE9] border border-[#E5E0D8] text-[11px] font-mono tracking-widest uppercase text-[#8C827A]">
                <Globe className="w-3 h-3 text-[#B0A69A]" />
                Languages
              </span>
              <div className="h-px flex-1 bg-[#E8E4DC]" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {languages.map((lang) => {
                const isSelected =
                  selectedLanguage === lang.value && selectedCategory === null;

                return (
                  <button
                    key={lang.value}
                    onClick={() => {
                      // Fire only onSelectLanguage — page handler clears selectedCategory
                      onSelectLanguage && onSelectLanguage(lang.value);
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 group ${
                      isSelected
                        ? "bg-[#2C2A29] text-[#FAF8F5] border-[#2C2A29] shadow-md"
                        : "bg-[#FAFAFA] border-[#EAE8E4] text-[#2C2723] hover:border-[#DCD7CE] hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Globe
                        className={`w-5 h-5 ${
                          isSelected
                            ? "text-[#E8E2D9]"
                            : "text-[#8C827A] group-hover:text-[#8C3A32]"
                        }`}
                      />
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-[#3D3732] text-[#E8E2D9]"
                            : "bg-[#F3EFEA] text-[#7C7775]"
                        }`}
                      >
                        {lang.count} {lang.count === 1 ? "work" : "works"}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-medium text-base leading-tight">
                        {lang.label}
                      </h3>
                      <p
                        className={`text-[11px] font-sans mt-0.5 ${
                          isSelected ? "text-[#B0A69A]" : "text-[#8C827A]"
                        }`}
                      >
                        Browse {lang.label.toLowerCase()} works
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
