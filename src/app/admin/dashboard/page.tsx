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
  Mail,
  User,
  Calendar,
  X,
  Send,
  RefreshCw,
  Search,
  BookOpen,
  Inbox,
  Check,
  BarChart3,
  ExternalLink,
  ShieldAlert,
  Rss,
  Share2,
  ArrowRight,
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

interface Poem {
  id: string;
  created_at?: string;
  updated_at?: string;
  title: string;
  author: string;
  category: string;
  body: string;
}

// Inline Instagram Icon Component
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"pending" | "published">("pending");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [publishedPoems, setPublishedPoems] = useState<Poem[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Fetch all pending submissions and published poems safely and independently
  const fetchData = async () => {
    setLoading(true);
    setErrorDetails(null);

    // Get current user session
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.email) {
        setCurrentUser(authData.user.email);
      }
    } catch {
      // ignore
    }

    // 1. Fetch pending submissions (with client query + server API fallback)
    try {
      let subData: any[] | null = null;
      const { data: orderedSubs, error: orderError } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (orderError) {
        const { data: fallbackSubs, error: fallbackError } = await supabase
          .from("submissions")
          .select("*");
        if (!fallbackError) {
          subData = fallbackSubs;
        }
      } else {
        subData = orderedSubs;
      }

      // If client query returns 0 rows (e.g. RLS blocked), fetch from server API
      if (!subData || subData.length === 0) {
        try {
          const res = await fetch("/api/admin/submissions");
          if (res.ok) {
            const json = await res.json();
            if (json.data && json.data.length > 0) {
              subData = json.data;
            }
            if (json.user && !currentUser) {
              setCurrentUser(json.user);
            }
          }
        } catch (apiErr) {
          console.warn("API fallback in dashboard:", apiErr);
        }
      }

      // Filter out rows that have is_published === true
      const pending = (subData || [])
        .filter((item: any) => item.is_published !== true)
        .sort((a: any, b: any) => {
          if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return 0;
        });

      setSubmissions(pending);
    } catch (err: any) {
      console.error("Submissions load error:", err);
      setErrorDetails((prev) =>
        prev
          ? `${prev} | Submissions: ${err.message}`
          : `Submissions: ${err.message}`
      );
    }

    // 2. Fetch published poems anthology (with fallback queries)
    try {
      let poemsData: any[] | null = null;
      const { data: orderedPoems, error: orderPoemsError } = await supabase
        .from("poems")
        .select("*")
        .order("created_at", { ascending: false });

      if (orderPoemsError) {
        const { data: fallbackPoems, error: fallbackPoemsError } = await supabase
          .from("poems")
          .select("*");
        if (fallbackPoemsError) throw fallbackPoemsError;
        poemsData = fallbackPoems;
      } else {
        poemsData = orderedPoems;
      }

      const sortedPoems = (poemsData || []).sort((a: any, b: any) => {
        const dateA = a.updated_at || a.created_at;
        const dateB = b.updated_at || b.created_at;
        if (dateA && dateB) {
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        }
        return 0;
      });

      setPublishedPoems(sortedPoems);
    } catch (err: any) {
      console.error("Poems load error:", err);
      setErrorDetails((prev) =>
        prev ? `${prev} | Poems: ${err.message}` : `Poems: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  // Publish workflow: Inserts into 'poems' and removes from 'submissions'
  const handlePublish = async (submission: Submission) => {
    setActionLoadingId(submission.id);
    try {
      const { data: insertedData, error: insertError } = await supabase
        .from("poems")
        .insert([
          {
            title: submission.title,
            body: submission.body,
            author: submission.author || "Anonymous",
            category: submission.category || "General",
          },
        ])
        .select();

      if (insertError) throw insertError;

      const { error: deleteError } = await supabase
        .from("submissions")
        .delete()
        .eq("id", submission.id);

      if (deleteError) {
        console.warn("Soft updating submission:", deleteError);
        await supabase
          .from("submissions")
          .update({ is_published: true })
          .eq("id", submission.id);
      }

      setSubmissions((prev) => prev.filter((item) => item.id !== submission.id));

      const newPoem: Poem = (insertedData && insertedData[0]) || {
        id: submission.id,
        title: submission.title,
        body: submission.body,
        author: submission.author || "Anonymous",
        category: submission.category || "General",
        created_at: new Date().toISOString(),
      };

      setPublishedPoems((prev) => [newPoem, ...prev]);
      showToast(`"${submission.title}" published successfully!`);
    } catch (err: any) {
      console.error("Publish error:", err);
      showToast(err.message || "Failed to publish submission.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject / Delete submission
  const handleDeleteSubmission = async (id: string) => {
    if (!confirm("Are you sure you want to reject and delete this submission?")) return;

    setActionLoadingId(id);
    try {
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

  // Delete a published poem from live anthology
  const handleDeletePublishedPoem = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" from the live published anthology?`)) return;

    setActionLoadingId(id);
    try {
      const { error } = await supabase.from("poems").delete().eq("id", id);
      if (error) throw error;

      setPublishedPoems((prev) => prev.filter((item) => item.id !== id));
      showToast(`"${title}" removed from published archive.`);
    } catch (err: any) {
      console.error("Delete poem error:", err);
      showToast(err.message || "Failed to delete poem.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Save changes via modal
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
        prev.map((item) => (item.id === editingSubmission.id ? editingSubmission : item))
      );

      setEditingSubmission(null);
      showToast("Changes saved successfully.");
    } catch (err: any) {
      console.error("Update error:", err);
      showToast(err.message || "Failed to update record.");
    }
  };

  // Filtered lists based on search and category
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

  const filteredPublished = useMemo(() => {
    return publishedPoems.filter((item) => {
      const matchesSearch =
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.body?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [publishedPoems, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2A29] p-4 sm:p-8 lg:p-12 font-sans relative selection:bg-[#E8E2D9]">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#2C2A29] text-[#FAF8F5] px-5 py-3 rounded-2xl text-xs font-serif shadow-xl border border-[#3D3732] flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#E3D9CC] pb-8">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#E8E2D9] text-[#8C3A32] text-[10px] font-mono uppercase tracking-widest font-medium">
                Admin Control Panel
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1F1E1D] flex items-center gap-3">
              <span>Editorial Dashboard</span>
              <Sparkles className="w-6 h-6 text-[#8C3A32]" />
            </h1>
            <p className="text-xs sm:text-sm font-serif text-[#7C7775]">
              Manage community submissions, audit publications, and curate the poetry stream.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {currentUser && (
              <div className="px-3 py-1.5 rounded-xl bg-[#F3EFEA] border border-[#E3D9CC] text-[11px] font-mono text-[#5A5654] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentUser}</span>
              </div>
            )}

            <Link
              href="/admin/dashboard/feed"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F3EFEA] border border-[#E3D9CC] text-xs font-serif hover:bg-[#E8E2D9] transition-all shadow-sm active:scale-95 text-[#2C2A29]"
            >
              <Rss className="w-3.5 h-3.5 text-[#8C3A32]" />
              <span>Dashboard Feed</span>
            </Link>

            <Link
              href="/admin/dashboard/sharecontent"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F3EFEA] border border-[#E3D9CC] text-xs font-serif hover:bg-[#E8E2D9] transition-all shadow-sm active:scale-95 text-[#2C2A29]"
            >
              <Share2 className="w-3.5 h-3.5 text-[#8C3A32]" />
              <span>Share Content</span>
            </Link>

            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F3EFEA] border border-[#E3D9CC] text-xs font-serif hover:bg-[#E8E2D9] transition-all shadow-sm active:scale-95 text-[#2C2A29] cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#8C3A32]" : ""}`} />
              <span>Sync Portal</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] transition-all shadow-sm active:scale-95"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-red-200 text-red-700 text-xs font-serif hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Database Notice State */}
        {errorDetails && (
          <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Supabase Data Sync Notice</p>
              <p className="font-mono text-[11px] text-amber-800 mt-0.5">{errorDetails}</p>
            </div>
          </div>
        )}

        {/* Navigation Quick Link Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/dashboard/feed"
            className="group p-5 bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl flex items-center justify-between hover:border-[#8C3A32] transition-all shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-[#F3EFEA] rounded-2xl group-hover:bg-[#8C3A32] group-hover:text-white transition-colors text-[#8C3A32]">
                <Rss className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold text-[#1F1E1D]">Go to Dashboard Feed</h3>
                <p className="text-xs font-serif text-[#7C7775]">Publish new poems directly & manage live feed</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#7C7775] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/admin/dashboard/sharecontent"
            className="group p-5 bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl flex items-center justify-between hover:border-[#8C3A32] transition-all shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-[#F3EFEA] rounded-2xl group-hover:bg-[#8C3A32] group-hover:text-white transition-colors text-[#8C3A32]">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold text-[#1F1E1D]">Go to Editorial Share Content</h3>
                <p className="text-xs font-serif text-[#7C7775]">Review, edit, and publish community submissions</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#7C7775] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl p-6 shadow-[0_4px_20px_rgba(44,42,41,0.02)] space-y-2">
            <div className="flex items-center justify-between text-[#7C7775]">
              <span className="text-xs font-serif">Pending Reviews</span>
              <Inbox className="w-4 h-4 text-[#8C3A32]" />
            </div>
            <div className="font-serif text-3xl text-[#1F1E1D]">{submissions.length}</div>
            <p className="text-[11px] font-serif text-[#7C7775]">Awaiting editor review</p>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl p-6 shadow-[0_4px_20px_rgba(44,42,41,0.02)] space-y-2">
            <div className="flex items-center justify-between text-[#7C7775]">
              <span className="text-xs font-serif">Published Works</span>
              <BookOpen className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="font-serif text-3xl text-[#1F1E1D]">{publishedPoems.length}</div>
            <p className="text-[11px] font-serif text-[#7C7775]">Live in anthology stream</p>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl p-6 shadow-[0_4px_20px_rgba(44,42,41,0.02)] space-y-2">
            <div className="flex items-center justify-between text-[#7C7775]">
              <span className="text-xs font-serif">Total Library</span>
              <BarChart3 className="w-4 h-4 text-[#7C7775]" />
            </div>
            <div className="font-serif text-3xl text-[#1F1E1D]">
              {submissions.length + publishedPoems.length}
            </div>
            <p className="text-[11px] font-serif text-[#7C7775]">Total records in system</p>
          </div>
        </div>

        {/* Tab Controls & Search Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E3D9CC]/80 pb-4">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-[#F3EFEA] p-1.5 rounded-2xl border border-[#E3D9CC]/80 self-start">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-serif transition-all cursor-pointer ${
                activeTab === "pending"
                  ? "bg-[#2C2A29] text-[#FAF8F5] shadow-sm"
                  : "text-[#7C7775] hover:text-[#2C2A29]"
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Pending Feed ({submissions.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("published")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-serif transition-all cursor-pointer ${
                activeTab === "published"
                  ? "bg-[#2C2A29] text-[#FAF8F5] shadow-sm"
                  : "text-[#7C7775] hover:text-[#2C2A29]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Published Archive ({publishedPoems.length})</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C7775]" />
              <input
                type="text"
                placeholder="Search title, author, body..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E3D9CC] text-xs font-serif focus:outline-none focus:border-[#8C3A32] placeholder:text-[#A09A96]"
              />
            </div>

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
          </div>
        </div>

        {/* TAB 1: PENDING SUBMISSIONS FEED */}
        {activeTab === "pending" && (
          <div className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#E3D9CC] animate-pulse h-48"
                  />
                ))}
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-20 bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl space-y-3">
                <div className="p-3 bg-[#F3EFEA] rounded-full w-fit mx-auto text-[#7C7775]">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="font-serif text-base text-[#1F1E1D]">
                  {searchQuery ? "No matching submissions found" : "Desk is Clear!"}
                </p>
                <p className="font-serif text-xs text-[#7C7775] max-w-sm mx-auto">
                  {searchQuery
                    ? "No pending submissions matched your search query."
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
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-serif border-b border-[#E3D9CC]/60 pb-4">
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

                    {/* Body Text */}
                    <div className="p-5 rounded-2xl bg-[#F3EFEA]/50 border border-[#E3D9CC]/60">
                      <p className="font-serif text-xs sm:text-sm text-[#2C2A29] leading-relaxed whitespace-pre-wrap italic">
                        {item.body}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => handleDeleteSubmission(item.id)}
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
                        <span>Edit</span>
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
        )}

        {/* TAB 2: PUBLISHED POEMS ANTHOLOGY */}
        {activeTab === "published" && (
          <div className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#E3D9CC] animate-pulse h-40"
                  />
                ))}
              </div>
            ) : filteredPublished.length === 0 ? (
              <div className="text-center py-20 bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl space-y-2">
                <p className="font-serif text-sm text-[#2C2A29]">No published poems found</p>
                <p className="font-serif text-xs text-[#7C7775]">
                  {searchQuery
                    ? "Try clearing your search query."
                    : "When you approve submissions, they will appear in this published archive."}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredPublished.map((poem) => (
                  <article
                    key={poem.id}
                    className="bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl p-6 sm:p-7 space-y-4 shadow-[0_4px_20px_rgba(44,42,41,0.02)] flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-0.5 rounded-full bg-[#E8E2D9] text-[#8C3A32] font-mono text-[10px] uppercase tracking-wider">
                          {poem.category || "General"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> Live
                          </span>
                          <button
                            onClick={() => handleDeletePublishedPoem(poem.id, poem.title)}
                            disabled={actionLoadingId === poem.id}
                            className="p-1 text-[#7C7775] hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete from published archive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-serif text-xl text-[#1F1E1D]">{poem.title}</h3>
                        <p className="text-xs font-serif text-[#7C7775]">By {poem.author || "Anonymous"}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#F3EFEA]/40 border border-[#E3D9CC]/50">
                        <p className="font-serif text-xs text-[#2C2A29] leading-relaxed line-clamp-4 italic whitespace-pre-wrap">
                          {poem.body}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 text-[11px] font-mono text-[#8C827A] flex items-center justify-between border-t border-[#E3D9CC]/40">
                      <span>
                        {poem.created_at
                          ? new Date(poem.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })
                          : "Published"}
                      </span>
                      <Link
                        href={`/feed?id=${poem.id}`}
                        target="_blank"
                        className="hover:underline flex items-center gap-1 text-[#8C3A32]"
                      >
                        View in Feed <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
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
                    Poem Body
                  </label>
                  <textarea
                    required
                    rows={7}
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