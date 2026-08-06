"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Feather, Plus, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminFeedPage() {
  const router = useRouter();

  const [authorName, setAuthorName] = useState("");
  const [authorHandle, setAuthorHandle] = useState("");
  const [title, setTitle] = useState("");
  const [stanza, setStanza] = useState("");
  const [category, setCategory] = useState("Reflections");
  const [readTime, setReadTime] = useState("2 min read");
  const [hasAudio, setHasAudio] = useState(false);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const generateAvatar = (name: string) => {
    return (
      name
        .trim()
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "A"
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const cleanHandle = authorHandle.trim().startsWith("@")
        ? authorHandle.trim()
        : `@${authorHandle.trim()}`;

      let authorId: string | null = null;
      const { data: existingAuthor, error: fetchAuthorError } = await supabase
        .from("authors")
        .select("id")
        .eq("handle", cleanHandle)
        .maybeSingle();

      if (fetchAuthorError) throw fetchAuthorError;

      if (existingAuthor) {
        authorId = existingAuthor.id;
      } else {
        const { data: newAuthor, error: createAuthorError } = await supabase
          .from("authors")
          .insert([
            {
              name: authorName.trim(),
              handle: cleanHandle,
              avatar: generateAvatar(authorName),
            },
          ])
          .select("id")
          .single();

        if (createAuthorError) throw createAuthorError;
        authorId = newAuthor.id;
      }

      const { error: poemError } = await supabase.from("poems").insert([
        {
          title: title.trim(),
          stanza: stanza.trim(),
          category,
          read_time: readTime.trim() || "2 min read",
          has_audio: hasAudio,
          author_id: authorId,
          likes: 0,
          comments: 0,
        },
      ]);

      if (poemError) throw poemError;

      setTitle("");
      setStanza("");
      setStatus({
        type: "success",
        message: "Poetic work successfully published to the anthology feed!",
      });

      router.refresh();
    } catch (err: any) {
      console.error("Admin submit error:", err);
      setStatus({
        type: "error",
        message: err.message || "Failed to publish item. Please check your Supabase permissions.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2A29] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-[#E3D9CC] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#7C7775] mb-1">
              <Feather className="w-4 h-4 text-[#2C2A29]" />
              <span>Editorial Curation Control</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#1F1E1D]">
              Publish Mail Submissions
            </h1>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-xs font-serif text-[#7C7775] hover:text-[#2C2A29] underline transition-colors"
          >
            View Live Feed &rarr;
          </button>
        </div>

        {status && (
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-serif ${
              status.type === "success"
                ? "bg-[#EFEFD8] border-[#C8C896] text-[#3D4026]"
                : "bg-[#FBE8E8] border-[#E8B8B8] text-[#7A2E2E]"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#555C33]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-[#A33B3B]" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl p-6 sm:p-10 shadow-[0_4px_20px_rgba(44,42,41,0.02)] space-y-6"
        >
          <div className="space-y-4">
            <h2 className="font-serif text-sm font-medium border-b border-[#E3D9CC]/60 pb-2 text-[#4A423A]">
              1. Contributor Details (From Email)
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-serif text-[#5A5654] mb-1">
                  Author Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none focus:border-[#2C2A29] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-serif text-[#5A5654] mb-1">
                  Author Handle *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. @elena_rostova"
                  value={authorHandle}
                  onChange={(e) => setAuthorHandle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none focus:border-[#2C2A29] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h2 className="font-serif text-sm font-medium border-b border-[#E3D9CC]/60 pb-2 text-[#4A423A]">
              2. Content & Stanzas
            </h2>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-serif text-[#5A5654] mb-1">
                  Title of Piece *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solitude in Quiet Light"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none focus:border-[#2C2A29] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-serif text-[#5A5654] mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none focus:border-[#2C2A29] transition-colors"
                >
                  <option value="Reflections">Reflections</option>
                  <option value="Free Verse">Free Verse</option>
                  <option value="Sonnets">Sonnets</option>
                  <option value="Nature & Sea">Nature & Sea</option>
                  <option value="Nocturne">Nocturne</option>
                  <option value="Elegies">Elegies</option>
                  <option value="Urban Life">Urban Life</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-serif text-[#5A5654] mb-1">
                Poem / Story Body *
              </label>
              <textarea
                required
                rows={8}
                placeholder="Paste the verses or story text submitted from the email here..."
                value={stanza}
                onChange={(e) => setStanza(e.target.value)}
                className="w-full p-4 rounded-2xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif focus:outline-none focus:border-[#2C2A29] leading-relaxed transition-colors whitespace-pre-line"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 items-center pt-2 border-t border-[#E3D9CC]/60">
            <div>
              <label className="block text-xs font-serif text-[#5A5654] mb-1">
                Estimated Read Time
              </label>
              <input
                type="text"
                placeholder="2 min read"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none focus:border-[#2C2A29] transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 pt-4 sm:pt-0">
              <input
                type="checkbox"
                id="hasAudio"
                checked={hasAudio}
                onChange={(e) => setHasAudio(e.target.checked)}
                className="w-4 h-4 rounded border-[#E3D9CC] text-[#2C2A29] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="hasAudio" className="text-xs font-serif text-[#4A423A] cursor-pointer">
                Include Spoken Recitation Audio Indicator
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing Entry...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Publish to Homepage</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}