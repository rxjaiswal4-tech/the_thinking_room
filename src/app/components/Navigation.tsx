"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Feather,
  Compass,
  BookOpen,
  PenTool,
  Sparkles,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Crown,
  Rss,
} from "lucide-react";
import { SearchBar } from "../components/SearchBar"; // Imported here

interface NavItem {
  label: string;
  sublabel?: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Thinking Room", sublabel: "Sanctuary of thought", href: "/", icon: Compass },
  { label: "Poetic Stream", sublabel: "The daily feed", href: "/feed", icon: Rss },
  { label: "Categories", sublabel: "Anthologies & themes", href: "/categories", icon: BookOpen },
];

interface NavigationProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export function Navigation({ onCollapseChange }: NavigationProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Safely sync collapse state to parent layout
  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-[#2C2723]/40 backdrop-blur-sm z-40"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-[#FAFAFA] border-r border-[#EAE8E4] flex flex-col justify-between p-4 shadow-xl lg:shadow-none transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-72"} w-72`}
      >
        {/* Toggle Collapse Button */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3.5 top-8 z-50 p-1.5 rounded-full bg-[#FAFAFA] border border-[#EAE8E4] text-[#665E56] hover:text-[#2C2723] hover:bg-[#F3F1ED] shadow-sm active:scale-95 transition-transform focus:outline-none"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        <div className="flex flex-col gap-6 pt-12 lg:pt-0 overflow-hidden">
          {/* Logo / Brand */}
          <div className={`pt-2 ${isCollapsed ? "lg:flex lg:justify-center" : "px-2"}`}>
            <Link href="/" className="inline-flex items-center gap-3 group focus:outline-none">
              <div className="p-2.5 rounded-2xl bg-[#F3F0EA] border border-[#E8E4DC] text-[#4A423A] shrink-0 group-hover:bg-[#EAE5DC] transition-colors">
                <Feather className="w-5 h-5 stroke-[1.5]" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col text-left overflow-hidden whitespace-nowrap transition-opacity duration-200">
                  <span className="font-serif text-xl tracking-tight text-[#2C2723] font-medium italic">
                    Verse & Muse
                  </span>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#8C827A]">
                    Anthology No. 01
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Action Button */}
          <div>
            <Link
              href="/share"
              className={`w-full flex items-center p-3.5 rounded-2xl bg-[#2C2723] hover:bg-[#3D3732] text-[#FAF8F5] shadow-md border border-[#3D3732] transition-all ${
                isCollapsed ? "lg:justify-center" : "justify-between"
              }`}
            >
              <div className="flex items-center gap-3">
                <PenTool className="w-4 h-4 text-[#D8D2C6] shrink-0" />
                {!isCollapsed && (
                  <span className="font-serif text-sm whitespace-nowrap">
                    Share Your Thoughts
                  </span>
                )}
              </div>
              {!isCollapsed && <Sparkles className="w-3.5 h-3.5 text-[#C4BBAF] shrink-0" />}
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
            {!isCollapsed && (
              <p className="px-3 text-[11px] font-mono tracking-widest uppercase text-[#9C928A] mb-1">
                Navigation
              </p>
            )}
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3.5 p-3 rounded-xl transition-colors ${
                    isCollapsed ? "lg:justify-center" : "px-3.5"
                  } ${
                    isActive
                      ? "bg-[#F2EFE9] text-[#2C2723] font-medium border border-[#E5E0D8]"
                      : "text-[#665E56] hover:bg-[#F6F4EF]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && (
                    <div className="flex flex-col overflow-hidden whitespace-nowrap">
                      <span className="font-serif text-sm leading-none">{item.label}</span>
                      {item.sublabel && (
                        <span className="text-[10px] text-[#9C928A] mt-1">{item.sublabel}</span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Poe Quote */}
        {!isCollapsed && (
          <div className="p-4 rounded-2xl bg-[#F5F2EB]/60 border border-[#EAE5DC]">
            <p className="font-serif text-xs italic text-[#5C544C]">
              &ldquo;Poetry is the rhythmical creation of beauty in words.&rdquo;
            </p>
            <span className="block mt-2 text-[10px] font-mono uppercase text-[#A3988E]">
              — Edgar Allan Poe
            </span>
          </div>
        )}
      </aside>

      {/* Header Bar */}
      <header
        className={`fixed top-0 right-0 left-0 z-30 bg-[#FAF7F2]/85 backdrop-blur-md border-b border-[#EADFCF]/70 px-4 sm:px-8 py-3 flex items-center justify-between gap-3 transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-24" : "lg:pl-80"
        }`}
      >
        <div className="flex items-center gap-3 flex-1 max-w-sm sm:max-w-md">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#FAFAFA] border border-[#EAE8E4] shadow-sm text-[#38332E] active:scale-95 transition-transform"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Clean Sub-component Placement */}
          <SearchBar className="flex-1" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/share"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] active:scale-95 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D8D2C6]" />
            <span>New Verse</span>
          </Link>

         {/* <Link
            href="/premium"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#8A711C] hover:bg-[#D4AF37]/25 text-xs font-serif transition-colors shadow-sm"
          >
            <Crown className="w-3.5 h-3.5 text-[#B8860B]" />
            <span className="font-medium">Premium</span>
          </Link> */}
        </div>
      </header>
    </>
  );
}