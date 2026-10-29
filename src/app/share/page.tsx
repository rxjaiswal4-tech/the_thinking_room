"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navigation } from "../components/Navigation";
import {
  Feather,
  ArrowLeft,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Check,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface TagItem {
  id?: string;
  name: string;
  slug: string;
  is_preset?: boolean;
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

export default function SharePoemPage() {
  const [formData, setFormData] = useState({
    author: "",
    instagram: "",
    email: "",
    title: "",
    category: "Reflections",
    language: "english",
    body: "",
  });

  const [availableTags, setAvailableTags] = useState<TagItem[]>(PRESET_TAGS);
  const [selectedTags, setSelectedTags] = useState<TagItem[]>([]);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch dynamic preset & custom tags from Supabase if table exists
  useEffect(() => {
    async function loadDynamicTags() {
      if (!supabase) return;
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
    }

    loadDynamicTags();
  }, []);

  // Tag selection toggle
  const handleToggleTag = (tag: TagItem) => {
    setTagError(null);
    const normalizedSlug = tag.slug.toLowerCase().trim();
    const isAlreadySelected = selectedTags.some(
      (t) => t.slug.toLowerCase().trim() === normalizedSlug
    );

    if (isAlreadySelected) {
      setSelectedTags((prev) =>
        prev.filter((t) => t.slug.toLowerCase().trim() !== normalizedSlug)
      );
    } else {
      if (selectedTags.length >= 5) {
        setTagError("Maximum of 5 tags allowed per submission.");
        return;
      }
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleRemoveTag = (slug: string) => {
    setTagError(null);
    const normalizedSlug = slug.toLowerCase().trim();
    setSelectedTags((prev) =>
      prev.filter((t) => t.slug.toLowerCase().trim() !== normalizedSlug)
    );
  };

  // Create custom tag with normalization, duplicate prevention, and canonicalization
  const handleCreateCustomTag = async () => {
    setTagError(null);

    // 1. Trim leading and trailing whitespace
    const trimmed = newTagName.trim();
    if (!trimmed) {
      setTagError("Tag name cannot be empty.");
      return;
    }

    // 2. Normalize tag for comparison (slug)
    const normalizedSlug = trimmed.toLowerCase();

    // Prevent duplicate selection within current submission
    const isAlreadySelected = selectedTags.some(
      (t) => t.slug.toLowerCase().trim() === normalizedSlug
    );
    if (isAlreadySelected) {
      setNewTagName("");
      setIsCreatingTag(false);
      return;
    }

    // Validate maximum limit of 5 tags
    if (selectedTags.length >= 5) {
      setTagError("Maximum of 5 tags allowed per submission.");
      return;
    }

    // 3. Check whether normalized tag already exists in available preset or custom tags
    const existingTag = availableTags.find(
      (t) => t.slug.toLowerCase().trim() === normalizedSlug
    );

    if (existingTag) {
      // 4. Reuse existing tag instead of creating another one
      setSelectedTags((prev) => [...prev, existingTag]);
      setNewTagName("");
      setIsCreatingTag(false);
      return;
    }

    // 5. Canonicalize name (Capitalize first letter)
    const canonicalName =
      trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    let createdTagItem: TagItem = {
      name: canonicalName,
      slug: normalizedSlug,
      is_preset: false,
    };

    // Attempt to persist to Supabase tags table with unique constraint handling
    if (supabase) {
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
          // If unique constraint violation occurs (code 23505), fetch existing canonical tag
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
          } else {
            console.warn("Could not insert tag into database:", insertError);
          }
        } else if (dbData) {
          createdTagItem = dbData;
        }
      } catch (err) {
        console.warn("Failed to save tag to Supabase:", err);
      }
    }

    // 6. Update available tags and automatically select for current submission
    setAvailableTags((prev) => {
      if (prev.some((t) => t.slug.toLowerCase().trim() === normalizedSlug)) {
        return prev;
      }
      return [...prev, createdTagItem];
    });

    setSelectedTags((prev) => [...prev, createdTagItem]);
    setNewTagName("");
    setIsCreatingTag(false);
  };

  // Security Helper: Strip HTML tags and prevent URL/Phishing submissions
  const validateAndSanitize = (data: typeof formData) => {
    const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/[^\s]*)/gi;

    // Check for malicious links or phishing text in text fields
    if (
      urlPattern.test(data.author) ||
      urlPattern.test(data.title) ||
      urlPattern.test(data.body)
    ) {
      throw new Error("Submissions containing external web links or URLs are not allowed.");
    }

    // Sanitize string entries (Strips HTML tags)
    const sanitize = (text: string) => text.replace(/<[^>]*>?/gm, "").trim();

    const cleanLanguage = data.language?.toLowerCase().trim() || "english";
    const allowedLanguages = ["english", "hindi", "nepali", "urdu"];
    if (!allowedLanguages.includes(cleanLanguage)) {
      throw new Error("Please select a valid language (English, Hindi, Nepali, or Urdu).");
    }

    return {
      author: sanitize(data.author),
      instagram: sanitize(data.instagram).replace("@", ""),
      email: sanitize(data.email),
      title: sanitize(data.title),
      category: sanitize(data.category),
      language: cleanLanguage,
      body: sanitize(data.body),
    };
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      if (!supabase) {
        throw new Error("Database connection error. Please try again later.");
      }

      // 1. Sanitize input & validate anti-phishing rule
      const cleanData = validateAndSanitize(formData);

      if (!cleanData.author || !cleanData.title || !cleanData.body) {
        throw new Error("Please fill in all required fields (Author, Title, and Poem Body).");
      }

      // Generate client UUID for submission to safely link junction records
      const submissionId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : undefined;

      // 2. Direct insert into Supabase with fallback for schemas without is_published, language, or status columns
      const basePayload: Record<string, any> = {
        author: cleanData.author,
        instagram: cleanData.instagram || "",
        email: cleanData.email || "",
        title: cleanData.title,
        category: cleanData.category || "Reflections",
        language: cleanData.language,
        body: cleanData.body,
        status: "submitted",
      };

      if (submissionId) {
        basePayload.id = submissionId;
      }

      // Try inserting with status & is_published flag
      let { error } = await supabase.from("submissions").insert([
        {
          ...basePayload,
          is_published: false,
        },
      ]);

      // If schema doesn't have status column yet, retry without it
      if (error && error.message?.toLowerCase().includes("status")) {
        const withoutStatus = { ...basePayload };
        delete withoutStatus.status;
        const retryResult = await supabase.from("submissions").insert([
          {
            ...withoutStatus,
            is_published: false,
          },
        ]);
        error = retryResult.error;
      }

      // If schema doesn't have is_published column, retry cleanly without it
      if (error && error.message?.toLowerCase().includes("is_published")) {
        const retryPayload = { ...basePayload };
        delete retryPayload.is_published;
        delete retryPayload.status;
        const retryResult = await supabase.from("submissions").insert([retryPayload]);
        error = retryResult.error;
      }

      // If schema doesn't have language column yet, fallback cleanly without it
      if (error && error.message?.toLowerCase().includes("language")) {
        const withoutLangPayload = { ...basePayload };
        delete withoutLangPayload.language;
        delete withoutLangPayload.status;
        const retryResult = await supabase.from("submissions").insert([
          withoutLangPayload.is_published !== undefined
            ? withoutLangPayload
            : { ...withoutLangPayload, is_published: false },
        ]);
        error = retryResult.error;
      }

      if (error) {
        throw new Error(error.message);
      }

      // 3. Link selected tags into submission_tags junction table
      if (submissionId && selectedTags.length > 0) {
        try {
          const links: { submission_id: string; tag_id: string }[] = [];

          for (const tag of selectedTags) {
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

                if (createdDbTag?.id) {
                  tagId = createdDbTag.id;
                }
              }
            }

            if (tagId) {
              links.push({
                submission_id: submissionId,
                tag_id: tagId,
              });
            }
          }

          if (links.length > 0) {
            const { error: linkError } = await supabase
              .from("submission_tags")
              .insert(links);

            if (linkError) {
              console.warn("Could not insert submission_tags links:", linkError);
            }
          }
        } catch (tagLinkErr) {
          console.warn("Error associating tags with submission:", tagLinkErr);
        }
      }

      setStatusMessage({
        type: "success",
        text: "Your stanza has been received and sent to the editorial desk!",
      });

      // Clear form & selected tags
      setFormData({
        author: "",
        instagram: "",
        email: "",
        title: "",
        category: "Reflections",
        language: "english",
        body: "",
      });
      setSelectedTags([]);
    } catch (err: any) {
      console.error("Submission error:", err);
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to submit. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2A29] py-10 px-4 sm:px-6 lg:px-8 font-sans relative overflow-x-hidden selection:bg-[#E8E2D9]">
      {/* Tactile Paper Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035] z-50 mix-blend-multiply"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <Navigation />

      <div className="max-w-2xl mx-auto space-y-6 pt-6">
        {/* Navigation Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-serif text-[#7C7775] hover:text-[#2C2A29] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Anthology Feed</span>
        </Link>

        {/* Header */}
        <div className="border-b border-[#E3D9CC] pb-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#7C7775] mb-1">
            <Feather className="w-4 h-4 text-[#2C2A29]" />
            <span>Community Submission</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#1F1E1D]">
            Share Your Stanza & Thoughts
          </h1>
          <p className="text-xs text-[#7C7775] mt-1 font-serif">
            Submissions are sent directly to the editorial desk for review before publication.
          </p>
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl border text-xs font-serif flex items-center gap-3 ${
              statusMessage.type === "success"
                ? "bg-[#EFEFD0]/70 border-[#8A9A5B] text-[#2D3B1E]"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-[#8A9A5B] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Supabase Secure Submission Form */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(44,42,41,0.02)] space-y-5"
        >
          {/* Author Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif text-[#5A5654] mb-1">
                Author Name *
              </label>
              <input
                type="text"
                name="author"
                required
                value={formData.author}
                onChange={handleChange}
                placeholder="e.g. Elena Rostova"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none focus:border-[#2C2A29] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-serif text-[#5A5654] mb-1">
                Author Instagram Handle
              </label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="e.g. elena_rostova"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none focus:border-[#2C2A29] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-serif text-[#5A5654] mb-1">
              Author Email Address (For Editorial Contact)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none focus:border-[#2C2A29] transition-colors"
            />
          </div>

          {/* Title of Piece */}
          <div>
            <label className="block text-xs font-serif text-[#5A5654] mb-1">
              Title of Piece *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Solitude in Quiet Light"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none focus:border-[#2C2A29] transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-serif text-[#5A5654] mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none focus:border-[#2C2A29] transition-colors cursor-pointer"
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

          {/* Language Selection */}
          <div>
            <label className="block text-xs font-serif text-[#5A5654] mb-1">
              Language *
            </label>
            <select
              name="language"
              required
              value={formData.language}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none focus:border-[#2C2A29] transition-colors cursor-pointer capitalize"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-serif text-[#5A5654]">
                Tags <span className="text-[11px] text-[#8C827A] font-normal">(Up to 5)</span>
              </label>
              {selectedTags.length > 0 && (
                <span className="text-[10px] font-mono text-[#7C7775]">
                  {selectedTags.length} / 5 selected
                </span>
              )}
            </div>

            {/* Selected Tags Chips */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-[#F3EFEA]/70 border border-[#E3D9CC]/80 min-h-[42px]">
                {selectedTags.map((tag) => (
                  <span
                    key={tag.slug}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif shadow-xs"
                  >
                    <span>{tag.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag.slug)}
                      className="text-[#FAF8F5]/70 hover:text-white transition-colors cursor-pointer"
                      aria-label={`Remove tag ${tag.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Available Preset Tags */}
            <div className="space-y-1.5 pt-0.5">
              <p className="text-[11px] font-serif text-[#7C7775]">
                Select from themes or create your own:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.some(
                    (t) => t.slug.toLowerCase().trim() === tag.slug.toLowerCase().trim()
                  );
                  return (
                    <button
                      key={tag.slug}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#2C2A29] text-[#FAF8F5] border border-[#2C2A29] shadow-xs"
                          : "bg-[#F3EFEA] hover:bg-[#EAE5DC] text-[#2C2A29] border border-[#E3D9CC]"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 mr-1 text-[#8A9A5B]" />}
                      <span>{tag.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Create Custom Tag */}
            <div className="pt-1">
              {!isCreatingTag ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingTag(true);
                    setTagError(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-serif text-[#8C3A32] hover:text-[#2C2A29] transition-colors cursor-pointer font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create tag</span>
                </button>
              ) : (
                <div className="p-3.5 rounded-2xl bg-[#F3EFEA]/80 border border-[#E3D9CC] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif text-[#5A5654] font-medium">
                      Create new tag
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingTag(false);
                        setNewTagName("");
                        setTagError(null);
                      }}
                      className="text-[#7C7775] hover:text-[#2C2A29] text-xs cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
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
                          handleCreateCustomTag();
                        }
                      }}
                      placeholder="Enter tag name (e.g. Solitude)"
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E3D9CC] bg-[#FAF8F5] text-xs font-serif focus:outline-none focus:border-[#2C2A29]"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleCreateCustomTag}
                      className="px-4 py-2 rounded-xl bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] transition-colors cursor-pointer shrink-0"
                    >
                      Create
                    </button>
                  </div>
                </div>
              )}

              {tagError && (
                <p className="text-[11px] text-red-600 font-serif flex items-center gap-1 mt-1.5">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{tagError}</span>
                </p>
              )}
            </div>
          </div>

          {/* Stanza Content */}
          <div>
            <label className="block text-xs font-serif text-[#5A5654] mb-1">
              Poem or Thought *
            </label>
            <textarea
              name="body"
              required
              rows={8}
              value={formData.body}
              onChange={handleChange}
              placeholder="Write or paste verses here..."
              className="w-full p-4 rounded-2xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif focus:outline-none focus:border-[#2C2A29] leading-relaxed transition-colors whitespace-pre-line"
            />
          </div>

          {/* Editorial Note */}
          <div className="p-3.5 rounded-xl bg-[#F3EFEA]/70 border border-[#E3D9CC]/80 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#8C3A32] shrink-0 mt-0.5" />
            <p className="text-[11px] font-serif text-[#665E56] leading-relaxed">
              Once submitted, your piece is securely queued in the editorial desk. Once curated, it will appear live in the Anthology Feed.
            </p>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Sending Submission...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Verse to Editor</span>
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}