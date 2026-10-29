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
  Eye,
  Plus,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface TagItem {
  id?: string;
  name: string;
  slug: string;
  is_preset?: boolean;
}

interface SubmissionTagRel {
  tag: TagItem;
}

interface Submission {
  id: string;
  created_at?: string;
  author: string;
  instagram?: string;
  email?: string;
  title: string;
  category: string;
  language?: string;
  status?: string;
  submission_tags?: SubmissionTagRel[];
  body: string;
  is_published?: boolean;
}

const PRESET_TAGS: TagItem[] = [
  { name: "Love", slug: "love", is_preset: true },
  { name: "Philosophy", slug: "philosophy", is_preset: true },
  { name: "Nature", slug: "nature", is_preset: true },
  { name: "Life", slug: "life", is_preset: true },
  { name: "Memory", slug: "memory", is_preset: true },
  { name: "Grief", slug: "grief", is_preset: true },
  { name: "Identity", slug: "identity", is_preset: true },
  { name: "Hope", slug: "hope", is_preset: true },
  { name: "Friendship", slug: "friendship", is_preset: true },
  { name: "Family", slug: "family", is_preset: true },
  { name: "Freedom", slug: "freedom", is_preset: true },
  { name: "Society", slug: "society", is_preset: true },
  { name: "Spirituality", slug: "spirituality", is_preset: true },
];

const LANGUAGE_OPTIONS = [
  { label: "English", value: "english" },
  { label: "Hindi", value: "hindi" },
  { label: "Nepali", value: "nepali" },
  { label: "Urdu", value: "urdu" },
];

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
  const [availableTags, setAvailableTags] = useState<TagItem[]>(PRESET_TAGS);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Modal editing
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [modalTags, setModalTags] = useState<TagItem[]>([]);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);

  // Fetch dynamic tags from database
  const loadDynamicTags = async () => {
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("id, name, slug, is_preset")
        .order("name", { ascending: true });

      if (!error && data && data.length > 0) {
        const slugMap = new Map<string, TagItem>();
        data.forEach((item: TagItem) => {
          slugMap.set(item.slug.toLowerCase().trim(), item);
        });
        PRESET_TAGS.forEach((preset) => {
          const key = preset.slug.toLowerCase().trim();
          if (!slugMap.has(key)) {
            slugMap.set(key, preset);
          }
        });
        setAvailableTags(Array.from(slugMap.values()));
      }
    } catch (err) {
      console.warn("Could not load dynamic tags, using preset list:", err);
    }
  };

  // Fetch submissions from Supabase with relational tags & server API fallback
  const fetchSubmissions = async () => {
    setLoading(true);
    setErrorDetails(null);

    try {
      // Check auth status
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.email) {
        setCurrentUser(authData.user.email);
      }

      await loadDynamicTags();

      // Query Supabase directly
      let directData: any[] | null = null;
      const { data: orderedData, error: orderError } = await supabase
        .from("submissions")
        .select("*, submission_tags(tag:tags(id, name, slug, is_preset))")
        .order("created_at", { ascending: false });

      if (orderError) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("submissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (fallbackError) {
          const { data: simpleData, error: simpleError } = await supabase
            .from("submissions")
            .select("*");
          if (!simpleError) {
            directData = simpleData;
          }
        } else {
          directData = fallbackData;
        }
      } else {
        directData = orderedData;
      }

      // If direct query returned 0 rows, fallback to server API route
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

      const formattedSubs = (directData || []).map((sub: any) => ({
        ...sub,
        language: sub.language || "english",
        status: sub.status || (sub.is_published ? "published" : "submitted"),
      }));

      setSubmissions(formattedSubs);
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

  // Status visual badge styling helper
  const getStatusBadge = (status?: string, is_published?: boolean) => {
    if (is_published || status === "published") {
      return {
        label: "Published",
        className: "bg-emerald-50 text-emerald-800 border-emerald-200",
      };
    }
    switch (status) {
      case "under_review":
        return {
          label: "Under Review",
          className: "bg-amber-50 text-amber-800 border-amber-200",
        };
      case "approved":
        return {
          label: "Approved",
          className: "bg-blue-50 text-blue-800 border-blue-200",
        };
      case "rejected":
        return {
          label: "Rejected",
          className: "bg-red-50 text-red-800 border-red-200",
        };
      case "draft":
        return {
          label: "Draft",
          className: "bg-neutral-100 text-neutral-700 border-neutral-200",
        };
      case "submitted":
      default:
        return {
          label: "Submitted",
          className: "bg-purple-50 text-purple-800 border-purple-200",
        };
    }
  };

  // Open submission for review: Sets status to under_review if currently submitted
  const handleReviewSubmission = async (submission: Submission) => {
    const attached = (submission.submission_tags || []).map((st) => st.tag).filter(Boolean);
    setModalTags(attached);
    setEditingSubmission(submission);
    setTagError(null);
    setIsCreatingTag(false);

    if (submission.status === "submitted") {
      try {
        await supabase
          .from("submissions")
          .update({ status: "under_review" })
          .eq("id", submission.id);

        setSubmissions((prev) =>
          prev.map((item) =>
            item.id === submission.id ? { ...item, status: "under_review" } : item
          )
        );
        setEditingSubmission((prev) =>
          prev && prev.id === submission.id ? { ...prev, status: "under_review" } : prev
        );
      } catch (err) {
        console.warn("Could not transition to under_review:", err);
      }
    }
  };

  // Open modal for editing
  const handleOpenEdit = (submission: Submission) => {
    const attached = (submission.submission_tags || []).map((st) => st.tag).filter(Boolean);
    setModalTags(attached);
    setEditingSubmission(submission);
    setTagError(null);
    setIsCreatingTag(false);
  };

  // Approve workflow: Sets status = 'approved', is_published = false (does NOT publish automatically)
  const handleApprove = async (submission: Submission) => {
    setActionLoadingId(submission.id);
    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          status: "approved",
          is_published: false,
        })
        .eq("id", submission.id);

      if (error) {
        await fetch("/api/admin/submissions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: submission.id,
            status: "approved",
            is_published: false,
          }),
        });
      }

      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === submission.id
            ? { ...item, status: "approved", is_published: false }
            : item
        )
      );

      showToast(`"${submission.title}" approved. Ready for publication.`);
    } catch (err: any) {
      console.error("Approve error:", err);
      showToast(err.message || "Failed to approve submission.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject workflow: Sets status = 'rejected', is_published = false
  const handleReject = async (submission: Submission) => {
    setActionLoadingId(submission.id);
    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          status: "rejected",
          is_published: false,
        })
        .eq("id", submission.id);

      if (error) {
        await fetch("/api/admin/submissions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: submission.id,
            status: "rejected",
            is_published: false,
          }),
        });
      }

      try {
        await supabase.from("poems").delete().eq("id", submission.id);
      } catch {
        // ignore
      }

      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === submission.id
            ? { ...item, status: "rejected", is_published: false }
            : item
        )
      );

      showToast(`"${submission.title}" marked as rejected.`);
    } catch (err: any) {
      console.error("Reject error:", err);
      showToast(err.message || "Failed to reject submission.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Publish workflow: Sets status = 'published', is_published = true, syncs to poems table
  const handlePublish = async (submission: Submission) => {
    setActionLoadingId(submission.id);
    try {
      // 1. Update submissions table
      let updateError = (
        await supabase
          .from("submissions")
          .update({
            status: "published",
            is_published: true,
          })
          .eq("id", submission.id)
      ).error;

      if (updateError) {
        await fetch("/api/admin/submissions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: submission.id,
            status: "published",
            is_published: true,
          }),
        });
      }

      // 2. Sync to poems table for live public feed
      const poemPayload = {
        id: submission.id,
        title: submission.title,
        body: submission.body,
        author: submission.author || "Anonymous",
        category: submission.category || "General",
      };

      try {
        await supabase.from("poems").upsert([poemPayload], { onConflict: "id" });
      } catch {
        await supabase.from("poems").insert([poemPayload]);
      }

      // 3. Update local state
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === submission.id
            ? { ...item, status: "published", is_published: true }
            : item
        )
      );

      showToast(`"${submission.title}" published and live on website!`);
    } catch (err: any) {
      console.error("Publish error:", err);
      showToast(err.message || "Failed to publish submission.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Unpublish workflow
  const handleUnpublish = async (submission: Submission) => {
    setActionLoadingId(submission.id);
    try {
      await supabase
        .from("submissions")
        .update({
          status: "approved",
          is_published: false,
        })
        .eq("id", submission.id);

      await supabase.from("poems").delete().eq("id", submission.id);

      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === submission.id
            ? { ...item, status: "approved", is_published: false }
            : item
        )
      );

      showToast(`"${submission.title}" unpublished and moved to approved status.`);
    } catch (err: any) {
      console.error("Unpublish error:", err);
      showToast(err.message || "Failed to unpublish.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Permanent Delete
  const handleDeletePermanent = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this submission?")) return;

    setActionLoadingId(id);
    try {
      const { error } = await supabase.from("submissions").delete().eq("id", id);
      if (error) {
        await fetch(`/api/admin/submissions?id=${id}`, { method: "DELETE" });
      }

      try {
        await supabase.from("poems").delete().eq("id", id);
      } catch {
        // ignore
      }

      setSubmissions((prev) => prev.filter((item) => item.id !== id));
      showToast("Submission deleted permanently.");
    } catch (err: any) {
      console.error("Delete error:", err);
      showToast(err.message || "Failed to delete submission.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Tag helper: Add existing tag to modal
  const handleAddTagToModal = (slug: string) => {
    setTagError(null);
    const normalizedSlug = slug.toLowerCase().trim();
    if (modalTags.some((t) => t.slug.toLowerCase().trim() === normalizedSlug)) return;

    const tagObj = availableTags.find((t) => t.slug.toLowerCase().trim() === normalizedSlug);
    if (tagObj) {
      setModalTags((prev) => [...prev, tagObj]);
    }
  };

  // Tag helper: Remove tag from modal
  const handleRemoveTagFromModal = (slug: string) => {
    setTagError(null);
    const normalizedSlug = slug.toLowerCase().trim();
    setModalTags((prev) =>
      prev.filter((t) => t.slug.toLowerCase().trim() !== normalizedSlug)
    );
  };

  // Tag helper: Create custom tag with duplicate prevention & canonicalization
  const handleCreateModalTag = async () => {
    setTagError(null);
    const trimmed = newTagName.trim();
    if (!trimmed) {
      setTagError("Tag name cannot be empty.");
      return;
    }

    const normalizedSlug = trimmed.toLowerCase();

    if (modalTags.some((t) => t.slug.toLowerCase().trim() === normalizedSlug)) {
      setNewTagName("");
      setIsCreatingTag(false);
      return;
    }

    const existingTag = availableTags.find(
      (t) => t.slug.toLowerCase().trim() === normalizedSlug
    );

    if (existingTag) {
      setModalTags((prev) => [...prev, existingTag]);
      setNewTagName("");
      setIsCreatingTag(false);
      return;
    }

    const canonicalName = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    let createdTagItem: TagItem = {
      name: canonicalName,
      slug: normalizedSlug,
      is_preset: false,
    };

    try {
      const { data: dbData, error: insertError } = await supabase
        .from("tags")
        .insert([
          {
            name: canonicalName,
            slug: normalizedSlug,
            is_preset: false,
          },
        ])
        .select("id, name, slug, is_preset")
        .maybeSingle();

      if (insertError) {
        if (
          insertError.code === "23505" ||
          insertError.message?.toLowerCase().includes("unique") ||
          insertError.message?.toLowerCase().includes("duplicate")
        ) {
          const { data: existingDbTag } = await supabase
            .from("tags")
            .select("id, name, slug, is_preset")
            .eq("slug", normalizedSlug)
            .maybeSingle();

          if (existingDbTag) {
            createdTagItem = existingDbTag;
          }
        }
      } else if (dbData) {
        createdTagItem = dbData;
      }
    } catch (err) {
      console.warn("Could not save custom tag to Supabase:", err);
    }

    setAvailableTags((prev) => {
      if (prev.some((t) => t.slug.toLowerCase().trim() === normalizedSlug)) return prev;
      return [...prev, createdTagItem];
    });

    setModalTags((prev) => [...prev, createdTagItem]);
    setNewTagName("");
    setIsCreatingTag(false);
  };

  // Save changes made in Modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubmission) return;

    const willBePublished = editingSubmission.status === "published";

    try {
      // 1. Update submissions table
      const { error: updateSubError } = await supabase
        .from("submissions")
        .update({
          title: editingSubmission.title,
          author: editingSubmission.author,
          category: editingSubmission.category,
          language: editingSubmission.language || "english",
          body: editingSubmission.body,
          email: editingSubmission.email || null,
          instagram: editingSubmission.instagram || null,
          status: editingSubmission.status || "submitted",
          is_published: willBePublished,
        })
        .eq("id", editingSubmission.id);

      if (updateSubError) {
        await fetch("/api/admin/submissions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingSubmission.id,
            title: editingSubmission.title,
            author: editingSubmission.author,
            category: editingSubmission.category,
            language: editingSubmission.language || "english",
            body: editingSubmission.body,
            email: editingSubmission.email || null,
            instagram: editingSubmission.instagram || null,
            status: editingSubmission.status || "submitted",
            is_published: willBePublished,
            tags: modalTags,
          }),
        });
      }

      // 2. Sync tags in submission_tags junction table
      try {
        await supabase
          .from("submission_tags")
          .delete()
          .eq("submission_id", editingSubmission.id);

        const linksToInsert = [];
        for (const tag of modalTags) {
          let tagId = tag.id;
          if (!tagId) {
            const { data: dbTag } = await supabase
              .from("tags")
              .select("id")
              .eq("slug", tag.slug.toLowerCase().trim())
              .maybeSingle();

            if (dbTag?.id) {
              tagId = dbTag.id;
            } else {
              const { data: createdDbTag } = await supabase
                .from("tags")
                .insert([
                  {
                    name: tag.name,
                    slug: tag.slug.toLowerCase().trim(),
                    is_preset: !!tag.is_preset,
                  },
                ])
                .select("id")
                .maybeSingle();

              if (createdDbTag?.id) tagId = createdDbTag.id;
            }
          }

          if (tagId) {
            linksToInsert.push({
              submission_id: editingSubmission.id,
              tag_id: tagId,
            });
          }
        }

        if (linksToInsert.length > 0) {
          await supabase.from("submission_tags").insert(linksToInsert);
        }
      } catch (tagErr) {
        console.warn("Could not sync submission_tags:", tagErr);
      }

      // 3. Sync live poems if published
      if (willBePublished) {
        const poemPayload = {
          id: editingSubmission.id,
          title: editingSubmission.title,
          body: editingSubmission.body,
          author: editingSubmission.author || "Anonymous",
          category: editingSubmission.category || "General",
        };
        try {
          await supabase.from("poems").upsert([poemPayload], { onConflict: "id" });
        } catch {
          await supabase.from("poems").insert([poemPayload]);
        }
      } else {
        try {
          await supabase.from("poems").delete().eq("id", editingSubmission.id);
        } catch {
          // ignore
        }
      }

      // 4. Update local state
      const updatedRelTags: SubmissionTagRel[] = modalTags.map((t) => ({ tag: t }));

      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === editingSubmission.id
            ? {
                ...editingSubmission,
                is_published: willBePublished,
                submission_tags: updatedRelTags,
              }
            : item
        )
      );

      setEditingSubmission(null);
      showToast("Submission changes saved successfully.");
    } catch (err: any) {
      console.error("Update error:", err);
      showToast(err.message || "Failed to save changes.");
    }
  };

  // Filtered submissions based on search, category, language, and status
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.author?.toLowerCase().includes(q) ||
        item.body?.toLowerCase().includes(q) ||
        item.language?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.instagram && item.instagram.toLowerCase().includes(q)) ||
        item.submission_tags?.some(
          (st) =>
            st.tag?.name?.toLowerCase().includes(q) ||
            st.tag?.slug?.toLowerCase().includes(q)
        );

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      const matchesLanguage =
        selectedLanguage === "All" ||
        (item.language || "english").toLowerCase() === selectedLanguage.toLowerCase();

      const itemStatus = item.status || (item.is_published ? "published" : "submitted");
      const matchesStatus =
        selectedStatus === "All" || itemStatus === selectedStatus;

      return matchesSearch && matchesCategory && matchesLanguage && matchesStatus;
    });
  }, [submissions, searchQuery, selectedCategory, selectedLanguage, selectedStatus]);

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
              Review, edit, curate language and tags, and publish community submissions directly.
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

        {/* Search & Extended Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#F3EFEA]/60 p-3 rounded-2xl border border-[#E3D9CC]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C7775]" />
            <input
              type="text"
              placeholder="Search by title, author, verses, tags, language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E3D9CC] text-xs font-serif focus:outline-none focus:border-[#8C3A32] placeholder:text-[#A09A96]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E3D9CC] text-xs font-serif focus:outline-none text-[#2C2A29] cursor-pointer"
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

            {/* Language */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E3D9CC] text-xs font-serif focus:outline-none text-[#2C2A29] cursor-pointer capitalize"
            >
              <option value="All">All Languages</option>
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E3D9CC] text-xs font-serif focus:outline-none text-[#2C2A29] cursor-pointer capitalize"
            >
              <option value="All">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="published">Published</option>
            </select>

            <span className="text-[11px] font-mono text-[#7C7775] whitespace-nowrap px-2">
              {filteredSubmissions.length} records
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
              {searchQuery || selectedCategory !== "All" || selectedLanguage !== "All" || selectedStatus !== "All"
                ? "No matching submissions found"
                : "Desk is clear!"}
            </p>
            <p className="font-serif text-xs text-[#7C7775] max-w-sm mx-auto">
              {searchQuery || selectedCategory !== "All" || selectedLanguage !== "All" || selectedStatus !== "All"
                ? "Try adjusting your search terms, category, language, or status filter."
                : "There are currently no new submissions waiting for review."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSubmissions.map((item) => {
              const statusInfo = getStatusBadge(item.status, item.is_published);
              return (
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
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#F3EFEA] border border-[#E3D9CC] text-[#8C3A32] font-mono text-[10px] uppercase tracking-wider font-semibold">
                        {item.category || "General"}
                      </span>

                      <span className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E3D9CC] text-[#5A5654] font-mono text-[10px] uppercase tracking-wider font-medium capitalize">
                        {item.language || "english"}
                      </span>

                      <span
                        className={`px-2.5 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider font-semibold border ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-wider ${
                          item.is_published
                            ? "bg-emerald-100/70 text-emerald-800 border border-emerald-300"
                            : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                        }`}
                      >
                        {item.is_published ? "Published" : "Unpublished"}
                      </span>
                    </div>

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

                  {/* Title & Contributor */}
                  <div className="space-y-1">
                    <h2 className="font-serif text-xl sm:text-2xl text-[#1F1E1D]">
                      {item.title}
                    </h2>
                    <p className="text-xs font-serif text-[#7C7775] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#8C3A32]" />
                      <span>
                        Submitted by <strong className="text-[#2C2A29]">{item.author || "Anonymous"}</strong>
                      </span>
                    </p>
                  </div>

                  {/* Tags Badges */}
                  {item.submission_tags && item.submission_tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.submission_tags.map(({ tag }) => (
                        <span
                          key={tag.slug || tag.name}
                          className="px-2.5 py-0.5 rounded-full bg-[#F3EFEA] border border-[#E3D9CC] text-[10px] font-serif text-[#5A5654]"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stanza Body */}
                  <div className="p-5 rounded-2xl bg-[#F3EFEA]/50 border border-[#E3D9CC]/60">
                    <p className="font-serif text-xs sm:text-sm text-[#2C2A29] leading-relaxed whitespace-pre-wrap italic">
                      {item.body}
                    </p>
                  </div>

                  {/* Action Toolbar */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    {/* Review Button */}
                    <button
                      onClick={() => handleReviewSubmission(item)}
                      disabled={actionLoadingId === item.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F3EFEA] border border-[#E3D9CC] text-[#2C2A29] text-xs font-serif hover:bg-[#E8E2D9] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#8C3A32]" />
                      <span>Review</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEdit(item)}
                      disabled={actionLoadingId === item.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F3EFEA] border border-[#E3D9CC] text-[#2C2A29] text-xs font-serif hover:bg-[#E8E2D9] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Content</span>
                    </button>

                    {/* Reject Button */}
                    {item.status !== "rejected" && (
                      <button
                        onClick={() => handleReject(item)}
                        disabled={actionLoadingId === item.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 text-red-700 text-xs font-serif hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    {/* Approve Button */}
                    {item.status !== "approved" && !item.is_published && (
                      <button
                        onClick={() => handleApprove(item)}
                        disabled={actionLoadingId === item.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EFEFD0]/80 border border-[#8A9A5B] text-[#2D3B1E] text-xs font-serif hover:bg-[#EFEFD0] transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-[#555C33]" />
                        <span>Approve</span>
                      </button>
                    )}

                    {/* Publish Button */}
                    {!item.is_published && (
                      <button
                        onClick={() => handlePublish(item)}
                        disabled={actionLoadingId === item.id}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          {actionLoadingId === item.id ? "Publishing..." : "Publish"}
                        </span>
                      </button>
                    )}

                    {/* Unpublish Button */}
                    {item.is_published && (
                      <button
                        onClick={() => handleUnpublish(item)}
                        disabled={actionLoadingId === item.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-amber-300 text-amber-800 bg-amber-50 text-xs font-serif hover:bg-amber-100 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Unpublish</span>
                      </button>
                    )}

                    {/* Permanent Delete for Rejected Submissions */}
                    {item.status === "rejected" && (
                      <button
                        onClick={() => handleDeletePermanent(item.id)}
                        disabled={actionLoadingId === item.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-red-200 text-red-700 text-xs font-serif hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Submission Modal: Category -> Language -> Tags -> Content */}
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
                <div>
                  <h3 className="font-serif text-lg text-[#1F1E1D]">
                    Edit Submission Content
                  </h3>
                  <p className="text-[11px] font-serif text-[#7C7775]">
                    Review and update category, language, tags, or verses before publishing.
                  </p>
                </div>
                <button
                  onClick={() => setEditingSubmission(null)}
                  className="p-1 rounded-full bg-[#F3EFEA] text-[#5A5654] hover:text-[#1F1E1D] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
                {/* Title & Author */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-serif text-[#5A5654] mb-1">
                      Title *
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
                      Contributor / Author *
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

                {/* Category, Language, Status */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-serif text-[#5A5654] mb-1">
                      Category *
                    </label>
                    <select
                      value={editingSubmission.category || "Reflections"}
                      onChange={(e) =>
                        setEditingSubmission({ ...editingSubmission, category: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif focus:outline-none focus:border-[#8C3A32] cursor-pointer"
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
                      Language *
                    </label>
                    <select
                      value={(editingSubmission.language || "english").toLowerCase()}
                      onChange={(e) =>
                        setEditingSubmission({ ...editingSubmission, language: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif focus:outline-none focus:border-[#8C3A32] cursor-pointer capitalize"
                    >
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-serif text-[#5A5654] mb-1">
                      Status
                    </label>
                    <select
                      value={editingSubmission.status || "submitted"}
                      onChange={(e) =>
                        setEditingSubmission({ ...editingSubmission, status: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif focus:outline-none focus:border-[#8C3A32] cursor-pointer capitalize"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                {/* Instagram & Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-serif text-[#5A5654] mb-1">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      value={editingSubmission.instagram || ""}
                      onChange={(e) =>
                        setEditingSubmission({ ...editingSubmission, instagram: e.target.value })
                      }
                      placeholder="e.g. author_poetry"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif focus:outline-none focus:border-[#8C3A32]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-serif text-[#5A5654] mb-1">
                      Email Address
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

                {/* Tags Management */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-serif text-[#5A5654]">
                      Tags
                    </label>
                    <span className="text-[10px] font-mono text-[#7C7775]">
                      {modalTags.length} attached
                    </span>
                  </div>

                  {/* Attached Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-[#F3EFEA]/70 border border-[#E3D9CC]/80 min-h-[42px]">
                    {modalTags.length === 0 ? (
                      <span className="text-[11px] text-[#7C7775] italic">No tags attached</span>
                    ) : (
                      modalTags.map((tag) => (
                        <span
                          key={tag.slug || tag.name}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif shadow-xs"
                        >
                          <span>{tag.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTagFromModal(tag.slug)}
                            className="text-[#FAF8F5]/70 hover:text-white transition-colors cursor-pointer"
                            title={`Remove ${tag.name}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Select Preset / Existing Tag & Create Tag */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddTagToModal(e.target.value);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif text-[#2C2A29] focus:outline-none focus:border-[#8C3A32] cursor-pointer"
                    >
                      <option value="">Select tag ▾</option>
                      {availableTags
                        .filter(
                          (t) =>
                            !modalTags.some(
                              (mt) => mt.slug.toLowerCase().trim() === t.slug.toLowerCase().trim()
                            )
                        )
                        .map((tag) => (
                          <option key={tag.slug} value={tag.slug}>
                            {tag.name} {tag.is_preset ? "" : "(custom)"}
                          </option>
                        ))}
                    </select>

                    {!isCreatingTag ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingTag(true);
                          setTagError(null);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-serif text-[#8C3A32] hover:text-[#2C2A29] transition-colors cursor-pointer font-medium px-2.5 py-1.5 rounded-xl hover:bg-[#F3EFEA]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create tag</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newTagName}
                          onChange={(e) => {
                            setNewTagName(e.target.value);
                            setTagError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleCreateModalTag();
                            }
                          }}
                          placeholder="Tag name (e.g. Solitude)"
                          className="px-2.5 py-1.5 rounded-xl border border-[#E3D9CC] bg-[#FAF8F5] text-xs font-serif focus:outline-none focus:border-[#8C3A32]"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleCreateModalTag}
                          className="px-3 py-1.5 rounded-xl bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] cursor-pointer"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingTag(false);
                            setNewTagName("");
                            setTagError(null);
                          }}
                          className="p-1 text-[#7C7775] hover:text-[#2C2A29] cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {tagError && (
                    <p className="text-[11px] text-red-600 font-serif flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{tagError}</span>
                    </p>
                  )}
                </div>

                {/* Stanza Content */}
                <div>
                  <label className="block text-xs font-serif text-[#5A5654] mb-1">
                    Poem Body / Verses *
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

                {/* Modal Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E3D9CC]/60">
                  <div className="flex items-center gap-2">
                    {editingSubmission.status !== "approved" && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingSubmission({
                            ...editingSubmission,
                            status: "approved",
                          })
                        }
                        className="px-3 py-1.5 rounded-full border border-[#8A9A5B] bg-[#EFEFD0]/60 text-[#2D3B1E] text-xs font-serif hover:bg-[#EFEFD0] cursor-pointer"
                      >
                        Set as Approved
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingSubmission(null)}
                      className="px-4 py-2 rounded-full border border-[#E3D9CC] text-xs font-serif hover:bg-[#E8E2D9] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
