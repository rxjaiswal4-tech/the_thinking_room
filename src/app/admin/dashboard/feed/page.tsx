"use client";

/* eslint-disable react-hooks/set-state-in-effect */

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Feather,
  Plus,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Trash2,
  BookOpen,
  Tag as TagIcon,
  X,
  Edit3,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface Poem {
  id: string;
  title: string;
  body: string;
  author: string;
  category: string;
  language?: string;
  tags?: string[];
  created_at: string;
}

const PRESET_TAG_OPTIONS = [
  "Love",
  "Philosophy",
  "Nature",
  "Life",
  "Memory",
  "Grief",
  "Identity",
  "Hope",
  "Friendship",
  "Freedom",
  "Society",
  "Spirituality",
];

const LANGUAGE_OPTIONS = [
  { label: "English", value: "english" },
  { label: "Hindi", value: "hindi" },
  { label: "Nepali", value: "nepali" },
  { label: "Urdu", value: "urdu" },
];

export default function AdminFeedPage() {
  const router = useRouter();

  const [authorName, setAuthorName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("Philosophy");
  const [language, setLanguage] = useState("english");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>(PRESET_TAG_OPTIONS);
  const [customTagInput, setCustomTagInput] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const [poems, setPoems] = useState<Poem[]>([]);
  const [fetchingPoems, setFetchingPoems] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Edit Modal State
  const [editingPoem, setEditingPoem] = useState<Poem | null>(null);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editCustomTag, setEditCustomTag] = useState("");
  const [isEditingSaving, setIsEditingSaving] = useState(false);

  // Load available tags dynamically
  useEffect(() => {
    async function loadTags() {
      try {
        const { data } = await supabase.from("tags").select("name");
        if (data && data.length > 0) {
          const names = Array.from(
            new Set([...PRESET_TAG_OPTIONS, ...data.map((t: any) => t.name).filter(Boolean)])
          );
          setAvailableTags(names);
        }
      } catch {
        // use preset
      }
    }
    loadTags();
  }, []);

  const fetchPoems = async () => {
    setFetchingPoems(true);
    try {
      let { data, error } = await supabase
        .from("poems")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        const fallback = await supabase.from("poems").select("*");
        data = fallback.data;
      }

      // Also fetch tags from submission_tags
      const tagsByPoemId: Record<string, string[]> = {};
      try {
        const { data: stData } = await supabase
          .from("submission_tags")
          .select("submission_id, tag:tags(name)");
        if (stData) {
          stData.forEach((row: any) => {
            if (row.submission_id && row.tag?.name) {
              if (!tagsByPoemId[row.submission_id]) tagsByPoemId[row.submission_id] = [];
              if (!tagsByPoemId[row.submission_id].includes(row.tag.name)) {
                tagsByPoemId[row.submission_id].push(row.tag.name);
              }
            }
          });
        }
      } catch {
        // ignore
      }

      const formatted: Poem[] = (data || []).map((p: any) => {
        let tags: string[] = [];
        if (Array.isArray(p.tags) && p.tags.length > 0) {
          tags = p.tags;
        } else if (tagsByPoemId[p.id] && tagsByPoemId[p.id].length > 0) {
          tags = tagsByPoemId[p.id];
        }
        return {
          id: p.id,
          title: p.title,
          body: p.body,
          author: p.author || "Anonymous",
          category: p.category || "General",
          language: p.language || "english",
          tags,
          created_at: p.created_at,
        };
      });

      setPoems(formatted);
    } catch (err: unknown) {
      console.error("Error fetching poems:", err);
    } finally {
      setFetchingPoems(false);
    }
  };

  useEffect(() => {
    fetchPoems();
  }, []);

  const handleAddTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;
    const canonical = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    if (!selectedTags.some((t) => t.toLowerCase() === canonical.toLowerCase())) {
      setSelectedTags((prev) => [...prev, canonical]);
    }
  };

  const handleRemoveTag = (tagName: string) => {
    setSelectedTags((prev) => prev.filter((t) => t.toLowerCase() !== tagName.toLowerCase()));
  };

  const handleCreateCustomTag = () => {
    if (!customTagInput.trim()) return;
    const canonical = customTagInput.trim().charAt(0).toUpperCase() + customTagInput.trim().slice(1);
    handleAddTag(canonical);
    setCustomTagInput("");
    setIsCreatingTag(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const poemPayload: any = {
      title: title.trim(),
      body: body.trim(),
      author: authorName.trim() || "Anonymous",
      category: category || "General",
      language: language.toLowerCase().trim(),
    };
    if (selectedTags.length > 0) {
      poemPayload.tags = selectedTags;
    }

    try {
      let { data: insertedPoem, error } = await supabase
        .from("poems")
        .insert([poemPayload])
        .select()
        .maybeSingle();

      if (error) {
        // If error due to tags column, retry without tags column
        delete poemPayload.tags;
        const retry = await supabase.from("poems").insert([poemPayload]).select().maybeSingle();
        if (retry.error) throw retry.error;
        insertedPoem = retry.data;
      }

      // Link tags in submission_tags if insertedPoem exists
      if (insertedPoem?.id && selectedTags.length > 0) {
        try {
          for (const tagName of selectedTags) {
            const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            let { data: tagRow } = await supabase.from("tags").select("id").eq("slug", slug).maybeSingle();
            if (!tagRow) {
              const { data: newTag } = await supabase
                .from("tags")
                .insert([{ name: tagName, slug, is_preset: false }])
                .select("id")
                .maybeSingle();
              tagRow = newTag;
            }
            if (tagRow?.id) {
              await supabase.from("submission_tags").insert([
                { submission_id: insertedPoem.id, tag_id: tagRow.id },
              ]);
            }
          }
        } catch {
          // ignore
        }
      }

      setTitle("");
      setBody("");
      setAuthorName("");
      setSelectedTags([]);
      setStatus({
        type: "success",
        message: "Poetic work successfully published with tags to the anthology feed!",
      });

      fetchPoems();
      router.refresh();
    } catch (err: unknown) {
      console.error("Admin submit error:", err);
      setStatus({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to publish item. Please check your Supabase permissions.",
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

      try {
        await supabase.from("submission_tags").delete().eq("submission_id", id);
      } catch {
        // ignore
      }

      setStatus({
        type: "success",
        message: "Poem removed successfully.",
      });

      setPoems((prev) => prev.filter((poem) => poem.id !== id));
      router.refresh();
    } catch (err: unknown) {
      console.error("Admin delete error:", err);
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete item.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Open Edit Poem Modal
  const handleOpenEditModal = (poem: Poem) => {
    setEditingPoem(poem);
    setEditTags(poem.tags || []);
    setEditCustomTag("");
  };

  const handleSaveEditPoem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPoem) return;
    setIsEditingSaving(true);

    try {
      const updatePayload: any = {
        title: editingPoem.title,
        author: editingPoem.author || "Anonymous",
        category: editingPoem.category || "General",
        language: (editingPoem.language || "english").toLowerCase(),
        body: editingPoem.body,
        tags: editTags,
      };

      let { error } = await supabase.from("poems").update(updatePayload).eq("id", editingPoem.id);
      if (error) {
        delete updatePayload.tags;
        const retry = await supabase.from("poems").update(updatePayload).eq("id", editingPoem.id);
        if (retry.error) throw retry.error;
      }

      // Sync submission_tags junction table
      try {
        await supabase.from("submission_tags").delete().eq("submission_id", editingPoem.id);
        for (const tagName of editTags) {
          const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          let { data: tagRow } = await supabase.from("tags").select("id").eq("slug", slug).maybeSingle();
          if (!tagRow) {
            const { data: newTag } = await supabase
              .from("tags")
              .insert([{ name: tagName, slug, is_preset: false }])
              .select("id")
              .maybeSingle();
            tagRow = newTag;
          }
          if (tagRow?.id) {
            await supabase.from("submission_tags").insert([
              { submission_id: editingPoem.id, tag_id: tagRow.id },
            ]);
          }
        }
      } catch {
        // ignore
      }

      setPoems((prev) =>
        prev.map((p) =>
          p.id === editingPoem.id
            ? { ...editingPoem, tags: editTags }
            : p
        )
      );

      setStatus({
        type: "success",
        message: `"${editingPoem.title}" updated successfully with new tags!`,
      });
      setEditingPoem(null);
    } catch (err: any) {
      console.error("Save edit error:", err);
      alert(err.message || "Failed to update poem.");
    } finally {
      setIsEditingSaving(false);
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
              href="/feed"
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

            <div className="grid sm:grid-cols-3 gap-4">
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

              <div>
                <label className="block text-xs font-serif text-[#5A5654] mb-1">
                  Language *
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none focus:border-[#2C2A29] transition-colors"
                >
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
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

            {/* Tags Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-serif text-[#5A5654]">
                Tags (Seen in feed description like YouTube hashtags)
              </label>

              {/* Tag Chips */}
              <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-[#F3EFEA]/70 border border-[#E3D9CC]/80 min-h-[42px]">
                {selectedTags.length === 0 ? (
                  <span className="text-[11px] text-[#7C7775] italic">No tags selected yet</span>
                ) : (
                  selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif shadow-xs"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-[#FAF8F5]/70 hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Preset or Custom Tag */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) handleAddTag(e.target.value);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif text-[#2C2A29] focus:outline-none cursor-pointer"
                >
                  <option value="">Select preset tag ▾</option>
                  {availableTags
                    .filter((t) => !selectedTags.some((st) => st.toLowerCase() === t.toLowerCase()))
                    .map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                </select>

                {!isCreatingTag ? (
                  <button
                    type="button"
                    onClick={() => setIsCreatingTag(true)}
                    className="inline-flex items-center gap-1 text-xs font-serif text-[#8C3A32] hover:text-[#2C2A29] transition-colors cursor-pointer font-medium px-2.5 py-1.5 rounded-xl hover:bg-[#F3EFEA]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create tag</span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Tag name"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateCustomTag();
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[#8C3A32] bg-[#FAF8F5] text-xs font-serif text-[#2C2A29] focus:outline-none w-36"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCustomTag}
                      className="px-3 py-1.5 rounded-xl bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingTag(false)}
                      className="p-1 text-[#7C7775] hover:text-[#2C2A29] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-serif text-[#5A5654] mb-1">
                Poem Body *
              </label>
              <textarea
                required
                rows={6}
                placeholder="Write the full verse or stanza here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none focus:border-[#2C2A29] transition-colors font-serif leading-relaxed italic"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing Entry...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Publish to Homepage Feed</span>
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
              className="text-xs font-mono text-[#7C7775] hover:text-[#2C2A29] flex items-center gap-1 cursor-pointer"
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
                  className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E3D9CC] flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all hover:border-[#DCD7CE]"
                >
                  <div className="space-y-1.5 max-w-2xl flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-[#786F66] font-serif flex-wrap">
                      <span className="font-medium text-[#2C2723]">{poem.category}</span>
                      <span>•</span>
                      <span className="capitalize">{poem.language || "english"}</span>
                      <span>•</span>
                      <span>By {poem.author}</span>
                      <span>•</span>
                      <span>{formatDate(poem.created_at)}</span>
                    </div>

                    <h3 className="font-serif text-base font-medium text-[#2C2723]">
                      {poem.title}
                    </h3>

                    {/* Tags Display */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <TagIcon className="w-3 h-3 text-[#8C3A32]" />
                      {poem.tags && poem.tags.length > 0 ? (
                        poem.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-[#EAE5DC] text-[#2C2A29] text-[10px] font-mono"
                          >
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] font-serif text-[#7C7775] italic">
                          No tags attached
                        </span>
                      )}
                      <button
                        onClick={() => handleOpenEditModal(poem)}
                        className="text-[10px] font-serif text-[#8C3A32] hover:underline cursor-pointer ml-1"
                      >
                        + Edit Tags
                      </button>
                    </div>

                    <p className="text-xs text-[#786F66] font-serif line-clamp-2 italic pt-1">
                      {poem.body}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleOpenEditModal(poem)}
                      className="px-3 py-1.5 rounded-lg bg-[#F3EFEA] text-[#2C2A29] hover:bg-[#E8E2D9] transition-colors text-xs font-serif flex items-center gap-1.5 cursor-pointer"
                      title="Edit poem & tags"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#8C3A32]" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(poem.id)}
                      disabled={deletingId === poem.id}
                      className="px-3 py-1.5 rounded-lg bg-[#FBE8E8] text-[#7A2E2E] hover:bg-[#F7D4D4] transition-colors text-xs font-serif flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {deletingId === poem.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Poem Modal */}
      {editingPoem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E3D9CC] pb-3">
              <h3 className="font-serif text-lg text-[#1F1E1D]">Edit Poem & Tags</h3>
              <button
                onClick={() => setEditingPoem(null)}
                className="text-[#7C7775] hover:text-[#2C2A29] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPoem} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-serif text-[#5A5654] mb-1">Title</label>
                  <input
                    type="text"
                    value={editingPoem.title}
                    onChange={(e) => setEditingPoem({ ...editingPoem, title: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-serif text-[#5A5654] mb-1">Author</label>
                  <input
                    type="text"
                    value={editingPoem.author}
                    onChange={(e) => setEditingPoem({ ...editingPoem, author: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-serif text-[#5A5654] mb-1">Category</label>
                  <input
                    type="text"
                    value={editingPoem.category}
                    onChange={(e) => setEditingPoem({ ...editingPoem, category: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-serif text-[#5A5654] mb-1">Language</label>
                  <select
                    value={editingPoem.language || "english"}
                    onChange={(e) => setEditingPoem({ ...editingPoem, language: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif capitalize"
                  >
                    {LANGUAGE_OPTIONS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-serif text-[#5A5654]">
                  Tags ({editTags.length} attached)
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-[#F3EFEA] border border-[#E3D9CC] min-h-[36px]">
                  {editTags.length === 0 ? (
                    <span className="text-[11px] text-[#7C7775] italic">No tags attached</span>
                  ) : (
                    editTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-[11px] font-serif"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() =>
                            setEditTags((prev) => prev.filter((t) => t.toLowerCase() !== tag.toLowerCase()))
                          }
                          className="hover:text-red-300 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value && !editTags.some((t) => t.toLowerCase() === e.target.value.toLowerCase())) {
                        setEditTags((prev) => [...prev, e.target.value]);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif"
                  >
                    <option value="">+ Add preset tag ▾</option>
                    {availableTags
                      .filter((t) => !editTags.some((et) => et.toLowerCase() === t.toLowerCase()))
                      .map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                  </select>

                  <div className="inline-flex items-center gap-1 flex-1">
                    <input
                      type="text"
                      placeholder="Custom tag"
                      value={editCustomTag}
                      onChange={(e) => setEditCustomTag(e.target.value)}
                      className="px-2 py-1 rounded-lg border border-[#E3D9CC] bg-[#FAF8F5] text-xs font-serif flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (editCustomTag.trim()) {
                          const canonical = editCustomTag.trim().charAt(0).toUpperCase() + editCustomTag.trim().slice(1);
                          if (!editTags.some((t) => t.toLowerCase() === canonical.toLowerCase())) {
                            setEditTags((prev) => [...prev, canonical]);
                          }
                          setEditCustomTag("");
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-serif text-[#5A5654] mb-1">Poem Body</label>
                <textarea
                  rows={4}
                  value={editingPoem.body}
                  onChange={(e) => setEditingPoem({ ...editingPoem, body: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif italic"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3D9CC]">
                <button
                  type="button"
                  onClick={() => setEditingPoem(null)}
                  className="px-4 py-2 rounded-full border border-[#E3D9CC] text-xs font-serif hover:bg-[#F3EFEA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditingSaving}
                  className="px-5 py-2 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] disabled:opacity-50 cursor-pointer"
                >
                  {isEditingSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
