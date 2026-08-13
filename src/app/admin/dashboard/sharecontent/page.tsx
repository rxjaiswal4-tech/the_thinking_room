"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Trash2,
  Edit3,
  Sparkles,
  ArrowLeft,
  Mail,
  User,
  Calendar,
  X,
  Send,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Submission {
  id: string;
  created_at: string;
  author: string;
  instagram: string;
  email: string;
  title: string;
  category: string;
  body: string;
  is_published: boolean;
}

// Inline Instagram Icon
const InstagramIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function AdminShareContentPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // 1. Fetch ONLY UNPUBLISHED submissions from Supabase
  const fetchSubmissions = async () => {
    setLoading(true);
    setErrorDetails(null);

    if (!supabase) {
      setErrorDetails("Supabase client is not initialized.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("is_published", false) // <-- Filter: Only fetch pending/unpublished
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err: any) {
      console.error("Error fetching submissions:", err);
      setErrorDetails(err.message || "Failed to fetch from Supabase");
      showToast("Error loading submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 2. Publish submission: Copies to 'poems' and DELETES from 'submissions' feed
  const handlePublish = async (submission: Submission) => {
    setActionLoadingId(submission.id);
    try {
      if (!supabase) return;

      // Step A: Insert into poems table
      const { error: insertError } = await supabase.from("poems").insert([
        {
          title: submission.title,
          body: submission.body,
          author: submission.author,
          category: submission.category,
        },
      ]);

      if (insertError) throw insertError;

      // Step B: Delete from submissions table so it disappears permanently from feed
      const { error: deleteError } = await supabase
        .from("submissions")
        .delete()
        .eq("id", submission.id);

      if (deleteError) throw deleteError;

      // Step C: Update state UI immediately
      setSubmissions((prev) => prev.filter((item) => item.id !== submission.id));
      showToast(`"${submission.title}" published and moved to poems!`);
    } catch (err: any) {
      console.error("Publish error:", err);
      showToast(err.message || "Failed to publish submission.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete/Reject submission
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to reject and delete this submission?")) return;

    setActionLoadingId(id);
    try {
      if (!supabase) return;

      const { error } = await supabase.from("submissions").delete().eq("id", id);
      if (error) throw error;

      setSubmissions((prev) => prev.filter((item) => item.id !== id));
      showToast("Submission deleted.");
    } catch (err: any) {
      console.error("Delete error:", err);
      showToast(err.message || "Failed to delete submission.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Save changes made in Modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubmission || !supabase) return;

    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          title: editingSubmission.title,
          author: editingSubmission.author,
          category: editingSubmission.category,
          body: editingSubmission.body,
          email: editingSubmission.email,
          instagram: editingSubmission.instagram,
        })
        .eq("id", editingSubmission.id);

      if (error) throw error;

      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === editingSubmission.id ? editingSubmission : item
        )
      );

      setEditingSubmission(null);
      showToast("Submission updated.");
    } catch (err: any) {
      console.error("Update error:", err);
      showToast(err.message || "Failed to save changes.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2A29] p-6 sm:p-10 font-sans relative">
      {/* Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#2C2A29] text-[#FAF8F5] px-4 py-2.5 rounded-xl text-xs font-serif shadow-lg border border-[#3D3732]"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3D9CC] pb-6">
          <div className="space-y-1">
            <Link
              href="/admin/dashboard/feed"
              className="inline-flex items-center gap-1.5 text-xs font-serif text-[#7C7775] hover:text-[#2C2A29] transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard Feed</span>
            </Link>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#1F1E1D] flex items-center gap-2">
              <span>Editorial Desk</span>
              <Sparkles className="w-5 h-5 text-[#8C3A32]" />
            </h1>
            <p className="text-xs font-serif text-[#7C7775]">
              Review, edit, and publish community submissions to the live anthology.
            </p>
          </div>

          <button
            onClick={fetchSubmissions}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F3EFEA] border border-[#E3D9CC] text-xs font-serif hover:bg-[#E8E2D9] transition-all self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Submissions</span>
          </button>
        </div>

        {/* Connection Error Banner */}
        {errorDetails && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-1">
            <p className="font-semibold">Supabase Connection Error:</p>
            <p className="font-mono text-[11px]">{errorDetails}</p>
          </div>
        )}

        {/* Content List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#E3D9CC] animate-pulse h-40"
              />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl space-y-2">
            <p className="font-serif text-sm text-[#2C2A29]">Desk is clear!</p>
            <p className="font-serif text-xs text-[#7C7775]">
              There are currently no pending submissions.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((item) => (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(44,42,41,0.02)] space-y-5"
              >
                {/* Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-serif border-b border-[#E3D9CC]/60 pb-3">
                  <span className="px-3 py-1 rounded-full bg-[#F3EFEA] border border-[#E3D9CC] text-[#8C3A32] font-mono text-[10px] uppercase tracking-wider">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-4 text-[#7C7775]">
                    {item.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {item.email}
                      </span>
                    )}
                    {item.instagram && (
                      <span className="flex items-center gap-1">
                        <InstagramIcon className="w-3.5 h-3.5" />
                        @{item.instagram}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Title & Author */}
                <div className="space-y-1">
                  <h2 className="font-serif text-xl sm:text-2xl text-[#1F1E1D]">
                    {item.title}
                  </h2>
                  <p className="text-xs font-serif text-[#7C7775] flex items-center gap-1">
                    <User className="w-3 h-3 text-[#8C3A32]" />
                    <span>{item.author}</span>
                  </p>
                </div>

                {/* Stanza Body */}
                <div className="p-4 rounded-2xl bg-[#F3EFEA]/50 border border-[#E3D9CC]/60">
                  <p className="font-serif text-xs sm:text-sm text-[#2C2A29] leading-relaxed whitespace-pre-wrap italic">
                    {item.body}
                  </p>
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={actionLoadingId === item.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 text-red-700 text-xs font-serif hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => setEditingSubmission(item)}
                    disabled={actionLoadingId === item.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F3EFEA] border border-[#E3D9CC] text-[#2C2A29] text-xs font-serif hover:bg-[#E8E2D9] transition-colors disabled:opacity-50"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Content</span>
                  </button>

                  <button
                    onClick={() => handlePublish(item)}
                    disabled={actionLoadingId === item.id}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    <span>
                      {actionLoadingId === item.id ? "Publishing..." : "Approve & Publish"}
                    </span>
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Edit Submission Modal */}
      <AnimatePresence>
        {editingSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingSubmission(null)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E3D9CC]">
                <h3 className="font-serif text-lg text-[#1F1E1D]">
                  Edit Submission Content
                </h3>
                <button
                  onClick={() => setEditingSubmission(null)}
                  className="p-1 rounded-full bg-[#F3EFEA] text-[#5A5654] hover:text-[#1F1E1D]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-serif text-[#5A5654] mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editingSubmission.title || ""}
                      onChange={(e) =>
                        setEditingSubmission({ ...editingSubmission, title: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-serif text-[#5A5654] mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      value={editingSubmission.author || ""}
                      onChange={(e) =>
                        setEditingSubmission({ ...editingSubmission, author: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-serif text-[#5A5654] mb-1">
                      Category
                    </label>
                    <select
                      value={editingSubmission.category || "Reflections"}
                      onChange={(e) =>
                        setEditingSubmission({ ...editingSubmission, category: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none"
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

                  <div>
                    <label className="block text-xs font-serif text-[#5A5654] mb-1">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={editingSubmission.instagram || ""}
                      onChange={(e) =>
                        setEditingSubmission({ ...editingSubmission, instagram: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-serif text-[#5A5654] mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editingSubmission.email || ""}
                      onChange={(e) =>
                        setEditingSubmission({ ...editingSubmission, email: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-serif text-[#5A5654] mb-1">
                    Body / Stanza Content
                  </label>
                  <textarea
                    rows={8}
                    value={editingSubmission.body || ""}
                    onChange={(e) =>
                      setEditingSubmission({ ...editingSubmission, body: e.target.value })
                    }
                    className="w-full p-3.5 rounded-2xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif focus:outline-none whitespace-pre-wrap leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingSubmission(null)}
                    className="px-4 py-2 rounded-full border border-[#E3D9CC] text-xs font-serif hover:bg-[#E8E2D9]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}