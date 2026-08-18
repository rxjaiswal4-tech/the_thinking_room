"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Search,
  Check,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Submission {
  id: string;
  created_at?: string;
  author: string;
  instagram?: string;
  email?: string;
  title: string;
  category: string;
  body: string;
  is_published?: boolean;
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
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // 1. Fetch submissions from Supabase with resilient direct query and server API fallback
  const fetchSubmissions = async () => {
    setLoading(true);
    setErrorDetails(null);

    try {
      // Check auth status
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.email) {
        setCurrentUser(authData.user.email);
      }

      // Step A: Query Supabase directly
      let directData: any[] | null = null;
      const { data: orderedData, error: orderError } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (orderError) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("submissions")
          .select("*");

        if (!fallbackError) {
          directData = fallbackData;
        }
      } else {
        directData = orderedData;
      }

      // Step B: If direct query returned 0 rows (e.g. RLS blocked anon client), fetch from server API route
      if (!directData || directData.length === 0) {
        try {
          const res = await fetch("/api/admin/submissions");
          if (res.ok) {
            const json = await res.json();
            if (json.data && json.data.length > 0) {
              directData = json.data;
            }
            if (json.user && !currentUser) {
              setCurrentUser(json.user);
            }
          }
        } catch (apiErr) {
          console.warn("API fallback fetch:", apiErr);
        }
      }

      // Filter out records where is_published is true (if field present)
      const pending = (directData || [])
        .filter((item: any) => item.is_published !== true)
        .sort((a: any, b: any) => {
          if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return 0;
        });

      setSubmissions(pending);
    } catch (err: any) {
      console.error("Error fetching submissions:", err);
      setErrorDetails(err.message || "Failed to fetch submissions from Supabase.");
      showToast("Error loading submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 2. Publish submission: Copies to 'poems' and DELETES from 'submissions'
  const handlePublish = async (submission: Submission) => {
    setActionLoadingId(submission.id);
    try {
      // Step A: Insert into poems table
      const { error: insertError } = await supabase
        .from("poems")
        .insert([
          {
            title: submission.title,
            body: submission.body,
            author: submission.author || "Anonymous",
            category: submission.category || "General",
          },
        ]);

      if (insertError) throw insertError;

      // Step B: Delete from submissions table
      const { error: deleteError } = await supabase
        .from("submissions")
        .delete()
        .eq("id", submission.id);

      if (deleteError) {
        console.warn("Could not delete from submissions, attempting soft update:", deleteError);
        await supabase
          .from("submissions")
          .update({ is_published: true })
          .eq("id", submission.id);
      }

      // Step C: Update state UI immediately
      setSubmissions((prev) => prev.filter((item) => item.id !== submission.id));
      showToast(`"${submission.title}" published and added to live poems!`);
    } catch (err: any) {
      console.error("Publish error:", err);
      showToast(err.message || "Failed to publish submission.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete / Reject submission
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to reject and delete this submission?")) return;

    setActionLoadingId(id);
    try {
      const { error } = await supabase.from("submissions").delete().eq("id", id);
      if (error) throw error;

      setSubmissions((prev) => prev.filter((item) => item.id !== id));
      showToast("Submission deleted successfully.");
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
    if (!editingSubmission) return;

    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          title: editingSubmission.title,
          author: editingSubmission.author,
          category: editingSubmission.category,
          body: editingSubmission.body,
          email: editingSubmission.email || null,
          instagram: editingSubmission.instagram || null,
        })
        .eq("id", editingSubmission.id);

      if (error) throw error;

      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === editingSubmission.id ? editingSubmission : item
        )
      );

      setEditingSubmission(null);
      showToast("Submission changes saved.");
    } catch (err: any) {
      console.error("Update error:", err);
      showToast(err.message || "Failed to save changes.");
    }
  };

  // Filtered submissions based on search and category
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      const matchesSearch =
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.instagram && item.instagram.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [submissions, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2A29] p-6 sm:p-10 font-sans relative selection:bg-[#E8E2D9]">
      {/* Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#2C2A29] text-[#FAF8F5] px-5 py-3 rounded-2xl text-xs font-serif shadow-xl border border-[#3D3732] flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3D9CC] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-4 mb-2">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-serif text-[#2C2A29] hover:text-[#8C3A32] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard Feed</span>
              </Link>
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-serif text-[#7C7775] hover:text-[#2C2A29] underline transition-colors"
              >
                <span>View Live Feed</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#1F1E1D] flex items-center gap-2">
              <span>Editorial Desk</span>
              <Sparkles className="w-5 h-5 text-[#8C3A32]" />
            </h1>
            <p className="text-xs font-serif text-[#7C7775]">
              Review, edit, and publish community submissions directly from Supabase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
            {currentUser && (
              <div className="px-3 py-1.5 rounded-xl bg-[#F3EFEA] border border-[#E3D9CC] text-[11px] font-mono text-[#5A5654] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentUser}</span>
              </div>
            )}

            <button
              onClick={fetchSubmissions}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F3EFEA] border border-[#E3D9CC] text-xs font-serif hover:bg-[#E8E2D9] text-[#2C2A29] transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#8C3A32]" : ""}`} />
              <span>Refresh Submissions</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 text-red-700 text-xs font-serif hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Connection Error Banner */}
        {errorDetails && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-1">
            <p className="font-semibold">Supabase Connection Notice:</p>
            <p className="font-mono text-[11px]">{errorDetails}</p>
          </div>
        )}

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#F3EFEA]/60 p-3 rounded-2xl border border-[#E3D9CC]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C7775]" />
            <input
              type="text"
              placeholder="Search by title, author, verses, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E3D9CC] text-xs font-serif focus:outline-none focus:border-[#8C3A32] placeholder:text-[#A09A96]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E3D9CC] text-xs font-serif focus:outline-none text-[#2C2A29]"
            >
              <option value="All">All Categories</option>
              <option value="Reflections">Reflections</option>
              <option value="Free Verse">Free Verse</option>
              <option value="Sonnets">Sonnets</option>
              <option value="Nature & Sea">Nature & Sea</option>
              <option value="Nocturne">Nocturne</option>
              <option value="Elegies">Elegies</option>
              <option value="Urban Life">Urban Life</option>
            </select>

            <span className="text-[11px] font-mono text-[#7C7775] whitespace-nowrap px-2">
              {filteredSubmissions.length} pending
            </span>
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#E3D9CC] animate-pulse h-40"
              />
            ))}
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-16 bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#F3EFEA] flex items-center justify-center mx-auto text-[#7C7775]">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="font-serif text-sm text-[#2C2A29]">
              {searchQuery ? "No matching submissions found" : "Desk is clear!"}
            </p>
            <p className="font-serif text-xs text-[#7C7775] max-w-sm mx-auto">
              {searchQuery
                ? "Try adjusting your search terms or category filter."
                : "There are currently no new submissions waiting for review."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSubmissions.map((item) => (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(44,42,41,0.02)] space-y-5 hover:border-[#D1C4B4] transition-all"
              >
                {/* Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-serif border-b border-[#E3D9CC]/60 pb-3">
                  <span className="px-3 py-1 rounded-full bg-[#F3EFEA] border border-[#E3D9CC] text-[#8C3A32] font-mono text-[10px] uppercase tracking-wider font-semibold">
                    {item.category || "General"}
                  </span>
                  <div className="flex flex-wrap items-center gap-4 text-[#7C7775]">
                    {item.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#8C3A32]" />
                        {item.email}
                      </span>
                    )}
                    {item.instagram && (
                      <span className="flex items-center gap-1.5">
                        <InstagramIcon className="w-3.5 h-3.5 text-[#8C3A32]" />
                        @{item.instagram}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })
                        : "Recent"}
                    </span>
                  </div>
                </div>

                {/* Title & Author */}
                <div className="space-y-1">
                  <h2 className="font-serif text-xl sm:text-2xl text-[#1F1E1D]">
                    {item.title}
                  </h2>
                  <p className="text-xs font-serif text-[#7C7775] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#8C3A32]" />
                    <span>Submitted by <strong className="text-[#2C2A29]">{item.author || "Anonymous"}</strong></span>
                  </p>
                </div>

                {/* Stanza Body */}
                <div className="p-5 rounded-2xl bg-[#F3EFEA]/50 border border-[#E3D9CC]/60">
                  <p className="font-serif text-xs sm:text-sm text-[#2C2A29] leading-relaxed whitespace-pre-wrap italic">
                    {item.body}
                  </p>
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={actionLoadingId === item.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 text-red-700 text-xs font-serif hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => setEditingSubmission(item)}
                    disabled={actionLoadingId === item.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F3EFEA] border border-[#E3D9CC] text-[#2C2A29] text-xs font-serif hover:bg-[#E8E2D9] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Content</span>
                  </button>

                  <button
                    onClick={() => handlePublish(item)}
                    disabled={actionLoadingId === item.id}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
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
                  className="p-1 rounded-full bg-[#F3EFEA] text-[#5A5654] hover:text-[#1F1E1D] transition-colors cursor-pointer"
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
                      required
                      value={editingSubmission.title || ""}
                      onChange={(e) =>
                        setEditingSubmission({ ...editingSubmission, title: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif focus:outline-none focus:border-[#8C3A32]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-serif text-[#5A5654] mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      required
                      value={editingSubmission.author || ""}
                      onChange={(e) =>
                        setEditingSubmission({ ...editingSubmission, author: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif focus:outline-none focus:border-[#8C3A32]"
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
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif focus:outline-none focus:border-[#8C3A32]"
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
                      placeholder="username"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif focus:outline-none focus:border-[#8C3A32]"
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
                      placeholder="author@example.com"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif focus:outline-none focus:border-[#8C3A32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-serif text-[#5A5654] mb-1">
                    Body / Stanza Content
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={editingSubmission.body || ""}
                    onChange={(e) =>
                      setEditingSubmission({ ...editingSubmission, body: e.target.value })
                    }
                    className="w-full p-3.5 rounded-2xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif focus:outline-none focus:border-[#8C3A32] whitespace-pre-wrap leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingSubmission(null)}
                    className="px-4 py-2 rounded-full border border-[#E3D9CC] text-xs font-serif hover:bg-[#E8E2D9] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] flex items-center gap-1.5 transition-colors cursor-pointer"
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