"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navigation } from "../components/Navigation";
import { Feather, ArrowLeft, Send, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function SharePoemPage() {
  const [formData, setFormData] = useState({
    author: "",
    instagram: "",
    email: "",
    title: "",
    category: "Reflections",
    body: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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

    return {
      author: sanitize(data.author),
      instagram: sanitize(data.instagram).replace("@", ""),
      email: sanitize(data.email),
      title: sanitize(data.title),
      category: sanitize(data.category),
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

      // 2. Direct insert into Supabase with fallback for schemas without is_published column
      const basePayload = {
        author: cleanData.author,
        instagram: cleanData.instagram || null,
        email: cleanData.email || null,
        title: cleanData.title,
        category: cleanData.category || "Reflections",
        body: cleanData.body,
      };

      // Try inserting with is_published flag first
      let { error } = await supabase.from("submissions").insert([
        {
          ...basePayload,
          is_published: false,
        },
      ]);

      // If schema doesn't have is_published column, retry cleanly without it
      if (error && error.message?.toLowerCase().includes("is_published")) {
        const retryResult = await supabase.from("submissions").insert([basePayload]);
        error = retryResult.error;
      }

      if (error) {
        throw new Error(error.message);
      }

      setStatusMessage({
        type: "success",
        text: "Your stanza has been received and sent to the editorial desk!",
      });

      // Clear form
      setFormData({
        author: "",
        instagram: "",
        email: "",
        title: "",
        category: "Reflections",
        body: "",
      });
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

          {/* Piece Details */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
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

            <div>
              <label className="block text-xs font-serif text-[#5A5654] mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
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