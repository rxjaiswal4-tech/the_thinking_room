"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Feather, Plus, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Trash2, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from 'next/link';

interface Poem {
  id: string;
  title: string;
  body: string;
  author: string;
  category: string;
  created_at: string;
}

export default function AdminFeedPage() {
  const router = useRouter();

  const [authorName, setAuthorName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("Philosophy");

  const [poems, setPoems] = useState<Poem[]>([]);
  const [fetchingPoems, setFetchingPoems] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchPoems();
  }, []);

  const fetchPoems = async () => {
    setFetchingPoems(true);
    try {
      const { data, error } = await supabase
        .from("poems")
        .select("id, title, body, author, category, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPoems(data || []);
    } catch (err: any) {
      console.error("Error fetching poems:", err);
    } finally {
      setFetchingPoems(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const { error } = await supabase.from("poems").insert([
        {
          title: title.trim(),
          body: body.trim(),
          author: authorName.trim() || "Anonymous",
          category: category || "General",
        },
      ]);

      if (error) throw error;

      setTitle("");
      setBody("");
      setAuthorName("");
      setStatus({
        type: "success",
        message: "Poetic work successfully published to the anthology feed!",
      });

      fetchPoems();
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this poem from the live feed?")) return;

    setDeletingId(id);
    setStatus(null);

    try {
      const { error } = await supabase.from("poems").delete().eq("id", id);

      if (error) throw error;

      setStatus({
        type: "success",
        message: "Poem removed successfully.",
      });

      setPoems((prev) => prev.filter((poem) => poem.id !== id));
      router.refresh();
    } catch (err: any) {
      console.error("Admin delete error:", err);
      setStatus({
        type: "error",
        message: err.message || "Failed to delete item.",
      });
    } finally {
      setDeletingId(null);
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
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2A29] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-[#E3D9CC] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#5E5A58]">
              <Feather className="w-4 h-4 text-[#2C2A29]" aria-hidden="true" />
              <span>Editorial Curation Control</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#1F1E1D]">
              Manage Feed Submissions
            </h1>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Link
              href="/admin/dashboard"
              aria-label="Back to Dashboard Feed"
              className="inline-flex items-center gap-1.5 text-xs font-serif text-[#2C2A29] hover:text-[#8C3A32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C2A29] rounded transition-colors py-1"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to Dashboard Feed</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="text-xs font-serif text-[#7C7775] hover:text-[#2C2A29] underline focus-visible:ring-[#2C2A29] rounded transition-colors py-1"
            >
              View Live Feed &rarr;
            </Link>
          </div>
        </header>

        {/* Status Notification */}
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

        {/* Add Post Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl p-6 sm:p-10 shadow-[0_4px_20px_rgba(44,42,41,0.02)] space-y-6"
        >
          <div className="space-y-4">
            <h2 className="font-serif text-sm font-medium border-b border-[#E3D9CC]/60 pb-2 text-[#4A423A]">
              Publish New Poem / Entry
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-serif text-[#5A5654] mb-1">
                  Author Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
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
                  <option value="Philosophy">Philosophy</option>
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
                Title of Piece *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. The Importance of Critical Thinking"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none focus:border-[#2C2A29] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-serif text-[#5A5654] mb-1">
                Poem Body *
              </label>
              <textarea
                required
                rows={6}
                placeholder="Paste the verses or text content here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-4 rounded-2xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif focus:outline-none focus:border-[#2C2A29] leading-relaxed transition-colors whitespace-pre-line"
              />
            </div>
          </div>

          <div>
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

        {/* Existing Feed List / Delete Manager */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-[#E3D9CC] pb-2">
            <h2 className="font-serif text-lg font-normal text-[#1F1E1D] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#8C827A]" />
              <span>Published Posts ({poems.length})</span>
            </h2>
            <button
              onClick={fetchPoems}
              className="text-xs font-mono text-[#7C7775] hover:text-[#2C2A29] flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${fetchingPoems ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {fetchingPoems ? (
            <div className="p-6 text-center text-xs font-serif text-[#8C827A]">
              Loading entries...
            </div>
          ) : poems.length === 0 ? (
            <div className="p-8 text-center text-xs font-serif text-[#8C827A] bg-[#FAF8F5] rounded-2xl border border-[#E3D9CC]">
              No posts published yet.
            </div>
          ) : (
            <div className="space-y-3">
              {poems.map((poem) => (
                <div
                  key={poem.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E3D9CC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#DCD7CE]"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2 text-[11px] text-[#786F66] font-serif">
                      <span className="font-medium text-[#2C2723]">{poem.category}</span>
                      <span>•</span>
                      <span>By {poem.author}</span>
                      <span>•</span>
                      <span>{formatDate(poem.created_at)}</span>
                    </div>
                    <h3 className="font-serif text-base font-medium text-[#2C2723]">
                      {poem.title}
                    </h3>
                    <p className="text-xs text-[#786F66] font-serif line-clamp-2 italic">
                      {poem.body}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(poem.id)}
                    disabled={deletingId === poem.id}
                    className="self-end sm:self-center px-3 py-1.5 rounded-lg bg-[#FBE8E8] text-[#7A2E2E] hover:bg-[#F7D4D4] transition-colors text-xs font-serif flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    {deletingId === poem.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}