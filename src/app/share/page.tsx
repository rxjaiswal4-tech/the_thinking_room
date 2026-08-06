"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Feather, ArrowLeft, Send, Sparkles } from "lucide-react";

export default function SharePoemPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2A29] py-10 px-4 sm:px-6 lg:px-8 font-sans relative overflow-x-hidden">
      {/* Tactile Paper Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035] z-50 mix-blend-multiply"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-2xl mx-auto space-y-6">
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
            Submissions are sent to our editorial desk for review before publication.
          </p>
        </div>

        {/* FormSubmit Form */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          action="https://formsubmit.co/rxjaiswal4@gmail.com"
          method="POST"
          onSubmit={() => setIsSubmitting(true)}
          className="bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(44,42,41,0.02)] space-y-5"
        >
          {/* FormSubmit Configuration Fields */}
          <input
            type="hidden"
            name="_subject"
            value="New Poetry / Thought Submission for Stanza Feed"
          />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_next" value="http://localhost:3000/" />

          {/* Author / Contributor Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif text-[#5A5654] mb-1">
                Your Name *
              </label>
              <input
                type="text"
                name="Author Name"
                required
                placeholder="e.g. Elena Rostova"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none focus:border-[#2C2A29] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-serif text-[#5A5654] mb-1">
                Your Handle / Social Link *
              </label>
              <input
                type="text"
                name="Author Handle"
                required
                placeholder="e.g. @elena_rostova"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none focus:border-[#2C2A29] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-serif text-[#5A5654] mb-1">
              Your Email Address (For Editorial Contact) *
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none focus:border-[#2C2A29] transition-colors"
            />
          </div>

          {/* Piece Meta */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-serif text-[#5A5654] mb-1">
                Title of Piece *
              </label>
              <input
                type="text"
                name="Poem Title"
                required
                placeholder="e.g. Solitude in Quiet Light"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs focus:outline-none focus:border-[#2C2A29] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-serif text-[#5A5654] mb-1">
                Category *
              </label>
              <select
                name="Category"
                defaultValue="Reflections"
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
              Your Poem or Thought *
            </label>
            <textarea
              name="Poem / Stanza Content"
              required
              rows={8}
              placeholder="Write or paste your verses here..."
              className="w-full p-4 rounded-2xl border border-[#E3D9CC] bg-[#F3EFEA] text-xs font-serif focus:outline-none focus:border-[#2C2A29] leading-relaxed transition-colors whitespace-pre-line"
            />
          </div>

          {/* Note */}
          <div className="p-3.5 rounded-xl bg-[#F3EFEA]/70 border border-[#E3D9CC]/80 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#7C7775] shrink-0 mt-0.5" />
            <p className="text-[11px] font-serif text-[#665E56] leading-relaxed">
              Once submitted, your poem will be sent directly to the editor's desk. Once curated, it will appear live in the Anthology Feed.
            </p>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
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