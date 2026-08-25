"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Feather,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) throw error;

      if (data?.session) {
        // Refresh server components and cookies before navigating
        router.refresh();
        router.push(redirectTo);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMsg(err.message || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2A29] font-sans flex items-center justify-center p-4 sm:p-6 overflow-hidden relative selection:bg-[#E8E2D9]">
      {/* Background Animated Ambient Lights */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.15, scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 w-96 h-96 bg-[#8C3A32] rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.12, scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#2C2A29] rounded-full blur-3xl pointer-events-none"
      />

      {/* Floating Decorative Element */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-12 left-12 text-[#E3D9CC] hidden md:block"
      >
        <Feather className="w-10 h-10 transform -rotate-45" />
      </motion.div>

      {/* Main Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#FAF8F5] border border-[#E3D9CC] rounded-3xl p-7 sm:p-10 shadow-[0_10px_40px_rgba(44,42,41,0.04)] relative z-10"
      >
        {/* Header */}
        <div className="space-y-3 text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-12 h-12 bg-[#F3EFEA] border border-[#E3D9CC] rounded-2xl flex items-center justify-center mx-auto text-[#8C3A32] shadow-sm"
          >
            <ShieldCheck className="w-6 h-6" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-1"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E8E2D9] text-[#8C3A32] text-[10px] font-mono uppercase tracking-widest font-medium">
              <span>Restricted Access</span>
              <Sparkles className="w-3 h-3" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#1F1E1D]">
              Editorial Portal
            </h1>
            <p className="text-xs font-serif text-[#7C7775]">
              Enter your credentials to access the admin dashboard.
            </p>
          </motion.div>
        </div>

        {/* Error Alert Box */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-3.5 bg-red-50/90 border border-red-200 rounded-2xl text-xs text-red-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-serif leading-snug">{errorMsg}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-1.5"
          >
            <label className="block text-xs font-serif text-[#5A5654]">
              Admin Email
            </label>
            <div className="relative group">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C7775] group-focus-within:text-[#8C3A32] transition-colors" />
              <input
                type="email"
                required
                placeholder="admin@anthology.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F3EFEA] border border-[#E3D9CC] text-xs font-serif focus:outline-none focus:border-[#8C3A32] focus:bg-[#FAF8F5] transition-all placeholder:text-[#A09A96]"
              />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-1.5"
          >
            <label className="block text-xs font-serif text-[#5A5654]">
              Password
            </label>
            <div className="relative group">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C7775] group-focus-within:text-[#8C3A32] transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#F3EFEA] border border-[#E3D9CC] text-xs font-serif focus:outline-none focus:border-[#8C3A32] focus:bg-[#FAF8F5] transition-all placeholder:text-[#A09A96]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7C7775] hover:text-[#2C2A29] transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-2"
          >
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 rounded-2xl bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] active:scale-[0.98] transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2 group relative overflow-hidden cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate & Enter</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.div>
        </form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 pt-6 border-t border-[#E3D9CC]/60 text-center"
        >
          <p className="text-[11px] font-serif text-[#7C7775]">
            Protected Editorial Portal • Unauthorized access attempt logged.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2]" />}>
      <LoginContent />
    </Suspense>
  );
}