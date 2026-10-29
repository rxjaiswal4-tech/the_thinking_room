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
  Eye,
  Plus,
  AlertCircle,
  Tag as TagIcon,
  Globe,
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

interface Poem {
  id: string;
  created_at?: string;
  updated_at?: string;
  title: string;
  author: string;
  category: string;
  body: string;
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
  const [availableTags, setAvailableTags] = useState<TagItem[]>(PRESET_TAGS);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Edit Modal State
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [modalTags, setModalTags] = useState<TagItem[]>([]);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);

  // Load available tags dynamically
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

  // Fetch all submissions and published poems
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

    await loadDynamicTags();

    // 1. Fetch submissions (with relational tags & server fallback)
    try {
      let subData: any[] | null = null;
      const { data: orderedSubs, error: orderError } = await supabase
        .from("submissions")
        .select("*, submission_tags(tag:tags(id, name, slug, is_preset))")
        .order("created_at", { ascending: false });

      if (orderError) {
        const { data: fallbackSubs, error: fallbackError } = await supabase
          .from("submissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (fallbackError) {
          const { data: simpleSubs } = await supabase
            .from("submissions")
            .select("*");
          subData = simpleSubs || null;
        } else {
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

      // Format submissions: Normalize missing status based on is_published
      const formattedSubs = (subData || []).map((sub: any) => ({
        ...sub,
        language: sub.language || "english",
        status: sub.status || (sub.is_published ? "published" : "submitted"),
      }));

      setSubmissions(formattedSubs);
    } catch (err: any) {
      console.error("Submissions load error:", err);
      setErrorDetails((prev) =>
        prev
          ? `${prev} | Submissions: ${err.message}`
          : `Submissions: ${err.message}`
      );
    }

    // 2. Fetch published poems anthology
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

  // Status Badge visual styling helper
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

  // Open submission for review: Transitions status to under_review if currently submitted
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
        // Fallback via server API
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
        // Fallback via server API
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

      // Also ensure removed from live poems if it was published
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
      setPublishedPoems((prev) => prev.filter((p) => p.id !== submission.id));

      showToast(`"${submission.title}" rejected.`);
    } catch (err: any) {
      console.error("Reject error:", err);
      showToast(err.message || "Failed to reject submission.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Publish workflow: Sets status = 'published', is_published = true, syncs into poems table
  const handlePublish = async (submission: Submission) => {
    setActionLoadingId(submission.id);
    try {
      // 1. Update submissions table: status = published, is_published = true
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
        // Retry via API route
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

      const newPoem: Poem = {
        id: submission.id,
        title: submission.title,
        body: submission.body,
        author: submission.author || "Anonymous",
        category: submission.category || "General",
        created_at: submission.created_at || new Date().toISOString(),
      };

      setPublishedPoems((prev) => [
        newPoem,
        ...prev.filter((p) => p.id !== submission.id),
      ]);

      showToast(`"${submission.title}" published to live website!`);
    } catch (err: any) {
      console.error("Publish error:", err);
      showToast(err.message || "Failed to publish submission.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Unpublish workflow: Sets status = 'approved', is_published = false, removes from live poems
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
      setPublishedPoems((prev) => prev.filter((p) => p.id !== submission.id));

      showToast(`"${submission.title}" unpublished and moved to approved status.`);
    } catch (err: any) {
      console.error("Unpublish error:", err);
      showToast(err.message || "Failed to unpublish.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete submission permanently
  const handleDeleteSubmission = async (id: string) => {
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
      setPublishedPoems((prev) => prev.filter((item) => item.id !== id));
      showToast("Submission deleted permanently.");
    } catch (err: any) {
      console.error("Delete error:", err);
      showToast(err.message || "Failed to delete submission.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete a published poem from live archive
  const handleDeletePublishedPoem = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from the live published anthology?`)) return;

    setActionLoadingId(id);
    try {
      const { error } = await supabase.from("poems").delete().eq("id", id);
      if (error) throw error;

      // Update submission status to approved & unpublished
      await supabase
        .from("submissions")
        .update({ is_published: false, status: "approved" })
        .eq("id", id);

      setPublishedPoems((prev) => prev.filter((item) => item.id !== id));
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_published: false, status: "approved" } : item
        )
      );
      showToast(`"${title}" removed from published archive.`);
    } catch (err: any) {
      console.error("Delete poem error:", err);
      showToast(err.message || "Failed to delete poem.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Add existing tag to modal list
  const handleAddTagToModal = (slug: string) => {
    setTagError(null);
    const normalizedSlug = slug.toLowerCase().trim();
    if (modalTags.some((t) => t.slug.toLowerCase().trim() === normalizedSlug)) return;

    const tagObj = availableTags.find((t) => t.slug.toLowerCase().trim() === normalizedSlug);
    if (tagObj) {
      setModalTags((prev) => [...prev, tagObj]);
    }
  };

  // Remove tag from modal list
  const handleRemoveTagFromModal = (slug: string) => {
    setTagError(null);
    const normalizedSlug = slug.toLowerCase().trim();
    setModalTags((prev) =>
      prev.filter((t) => t.slug.toLowerCase().trim() !== normalizedSlug)
    );
  };

  // Create custom tag in modal with duplicate prevention and canonicalization
  const handleCreateModalTag = async () => {
    setTagError(null);
    const trimmed = newTagName.trim();
    if (!trimmed) {
      setTagError("Tag name cannot be empty.");
      return;
    }

    const normalizedSlug = trimmed.toLowerCase();

    // Prevent duplicate selection within modal
    if (modalTags.some((t) => t.slug.toLowerCase().trim() === normalizedSlug)) {
      setNewTagName("");
      setIsCreatingTag(false);
      return;
    }

    // Check if tag already exists in available preset or custom tags
    const existingTag = availableTags.find(
      (t) => t.slug.toLowerCase().trim() === normalizedSlug
    );

    if (existingTag) {
      setModalTags((prev) => [...prev, existingTag]);
      setNewTagName("");
      setIsCreatingTag(false);
      return;
    }

    // Canonicalize tag name (Capitalize first letter)
    const canonicalName = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    let createdTagItem: TagItem = {
      name: canonicalName,
      slug: normalizedSlug,
      is_preset: false,
    };

    // Attempt to persist to database
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

  // Save changes via modal
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
        // Fallback using server API route
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

        setPublishedPoems((prev) => [
          poemPayload as Poem,
          ...prev.filter((p) => p.id !== editingSubmission.id),
        ]);
      } else {
        try {
          await supabase.from("poems").delete().eq("id", editingSubmission.id);
        } catch {
          // ignore
        }
        setPublishedPoems((prev) => prev.filter((p) => p.id !== editingSubmission.id));
      }

      // 4. Update local submissions state
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
      showToast(err.message || "Failed to update record.");
    }
  };

  // Filtered lists based on search, category, language, and status
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

      // In "pending" tab: Show all submissions matching status filter, or if "All", show non-published
      const matchesTab =
        activeTab === "pending"
          ? selectedStatus === "All"
            ? !item.is_published && itemStatus !== "published"
            : true
          : item.is_published || itemStatus === "published";

      return matchesSearch && matchesCategory && matchesLanguage && matchesStatus && matchesTab;
    });
  }, [submissions, searchQuery, selectedCategory, selectedLanguage, selectedStatus, activeTab]);

  const filteredPublished = useMemo(() => {
    return publishedPoems.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.author?.toLowerCase().includes(q) ||
        item.body?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q);

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
              Manage community submissions, curate category, language, and tags, and control publication.
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
            <div className="font-serif text-3xl text-[#1F1E1D]">
              {
                submissions.filter(
                  (s) =>
                    !s.is_published &&
                    (s.status === "submitted" || s.status === "under_review" || !s.status)
                ).length
              }
            </div>
            <p className="text-[11px] font-serif text-[#7C7775]">Awaiting editor review</p>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl p-6 shadow-[0_4px_20px_rgba(44,42,41,0.02)] space-y-2">
            <div className="flex items-center justify-between text-[#7C7775]">
              <span className="text-xs font-serif">Published Works</span>
              <BookOpen className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="font-serif text-3xl text-[#1F1E1D]">
              {submissions.filter((s) => s.is_published || s.status === "published").length ||
                publishedPoems.length}
            </div>
            <p className="text-[11px] font-serif text-[#7C7775]">Live in anthology stream</p>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl p-6 shadow-[0_4px_20px_rgba(44,42,41,0.02)] space-y-2">
            <div className="flex items-center justify-between text-[#7C7775]">
              <span className="text-xs font-serif">Total Library</span>
              <BarChart3 className="w-4 h-4 text-[#7C7775]" />
            </div>
            <div className="font-serif text-3xl text-[#1F1E1D]">
              {submissions.length}
            </div>
            <p className="text-[11px] font-serif text-[#7C7775]">Total records in system</p>
          </div>
        </div>

        {/* Tab Controls & Extended Search Filter Bar */}
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
              <span>
                Submissions Feed (
                {submissions.filter((s) => !s.is_published && s.status !== "published").length}
                )
              </span>
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
              <span>
                Published Archive (
                {submissions.filter((s) => s.is_published || s.status === "published").length ||
                  publishedPoems.length}
                )
              </span>
            </button>
          </div>

          {/* Extended Filters: Search, Category, Language, Status */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C7775]" />
              <input
                type="text"
                placeholder="Search title, author, tag, body..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E3D9CC] text-xs font-serif focus:outline-none focus:border-[#8C3A32] placeholder:text-[#A09A96]"
              />
            </div>

            {/* Category Filter */}
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

            {/* Language Filter */}
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

            {/* Status Filter */}
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
          </div>
        </div>

        {/* TAB 1: SUBMISSIONS FEED */}
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
                  {searchQuery || selectedCategory !== "All" || selectedLanguage !== "All" || selectedStatus !== "All"
                    ? "No matching submissions found"
                    : "Desk is Clear!"}
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
                      {/* Meta Bar: Category, Language, Status, Publication Status, Date */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-serif border-b border-[#E3D9CC]/60 pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Category */}
                          <span className="px-3 py-1 rounded-full bg-[#F3EFEA] border border-[#E3D9CC] text-[#8C3A32] font-mono text-[10px] uppercase tracking-wider font-semibold">
                            {item.category || "General"}
                          </span>

                          {/* Language */}
                          <span className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E3D9CC] text-[#5A5654] font-mono text-[10px] uppercase tracking-wider font-medium capitalize">
                            {item.language || "english"}
                          </span>

                          {/* Status Badge */}
                          <span
                            className={`px-2.5 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider font-semibold border ${statusInfo.className}`}
                          >
                            {statusInfo.label}
                          </span>

                          {/* Publication Status Badge */}
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

                        {/* Email, Instagram, Date */}
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

                      {/* Body Text */}
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
                          <span>Edit</span>
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

                        {/* Approve Button (when submitted, under_review, or rejected) */}
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

                        {/* Publish Button (Only Admin can publish; ready when approved) */}
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

                        {/* If already published, offer Unpublish */}
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

                        {/* If rejected, allow permanent deletion */}
                        {item.status === "rejected" && (
                          <button
                            onClick={() => handleDeleteSubmission(item.id)}
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
                    : "When you publish submissions, they will appear in this published archive and on the public site."}
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
                    Edit & Review Submission
                  </h3>
                  <p className="text-[11px] font-serif text-[#7C7775]">
                    Modify category, language, tags, or content before publication.
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
                  {/* Category */}
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

                  {/* Language */}
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

                  {/* Status */}
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

                {/* Tags Management in Modal */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-serif text-[#5A5654]">
                      Tags
                    </label>
                    <span className="text-[10px] font-mono text-[#7C7775]">
                      {modalTags.length} attached
                    </span>
                  </div>

                  {/* Attached Tag Chips */}
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

                {/* Poem Content Body */}
                <div>
                  <label className="block text-xs font-serif text-[#5A5654] mb-1">
                    Poem Body / Content *
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

                {/* Modal Action Buttons */}
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
