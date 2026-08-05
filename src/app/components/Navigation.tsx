"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Feather,
  Compass,
  BookOpen,
  Bookmark,
  PenTool,
  Sparkles,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
} from "lucide-react";

interface NavItem {
  label: string;
  sublabel?: string;
  href: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  { label: "Thinking Room", sublabel: "Sanctuary of thought", href: "/", icon: Compass },
  { label: "Categories", sublabel: "Anthologies & themes", href: "/categories", icon: BookOpen },
  { label: "Saved Stanzas", sublabel: "Your quiet collection", href: "/saved", icon: Bookmark },
];

interface NavigationProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export function Navigation({ onCollapseChange }: NavigationProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // Mobile drawer state
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse state
  const [hasUnread, setHasUnread] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect desktop screen width safely
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (onCollapseChange) onCollapseChange(nextState);
  };

  // Keyboard shortcut listener ('/')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setIsMobileSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      } else if (e.key === "Escape") {
        inputRef.current?.blur();
        setIsMobileSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3 left-4 z-50 p-2.5 rounded-full bg-[#FAFAFA] border border-[#EAE8E4] shadow-sm text-[#38332E] active:scale-95 transition-transform"
        aria-label="Toggle Mobile Navigation"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-[#2C2723]/30 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Drawer */}
      <motion.aside
        initial={false}
        animate={{
          x: isDesktop ? 0 : isOpen ? 0 : "-100%",
          width: isDesktop ? (isCollapsed ? 80 : 288) : 280,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 z-40 h-screen bg-[#FAFAFA] border-r border-[#EAE8E4] flex flex-col justify-between p-5 shadow-xl lg:shadow-none"
      >
        {/* Desktop Collapse Handle */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3.5 top-8 z-50 p-1.5 rounded-full bg-[#FAFAFA] border border-[#EAE8E4] text-[#665E56] hover:text-[#2C2723] hover:bg-[#F3F1ED] shadow-sm active:scale-95 transition-transform"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Top Brand & Links */}
        <div className="flex flex-col gap-8 pt-10 lg:pt-0">
          <div className={`pt-2 ${isCollapsed && isDesktop ? "px-0 text-center" : "px-2"}`}>
            <Link href="/" onClick={() => setIsOpen(false)} className="inline-flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#F3F0EA] border border-[#E8E4DC] text-[#4A423A] shrink-0">
                <Feather className="w-5 h-5 stroke-[1.5]" />
              </div>
              {(!isCollapsed || !isDesktop) && (
                <div className="flex flex-col text-left overflow-hidden whitespace-nowrap">
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

          <div>
            <Link
              href="/share"
              onClick={() => setIsOpen(false)}
              className={`w-full flex items-center p-3.5 rounded-2xl bg-[#2C2723] hover:bg-[#3D3732] text-[#FAF8F5] shadow-md border border-[#3D3732] ${
                isCollapsed && isDesktop ? "justify-center" : "justify-between"
              }`}
            >
              <div className="flex items-center gap-3">
                <PenTool className="w-4 h-4 text-[#D8D2C6] shrink-0" />
                {(!isCollapsed || !isDesktop) && (
                  <span className="font-serif text-sm whitespace-nowrap">Share Your Thoughts</span>
                )}
              </div>
              {(!isCollapsed || !isDesktop) && <Sparkles className="w-3.5 h-3.5 text-[#C4BBAF] shrink-0" />}
            </Link>
          </div>

          <nav className="flex flex-col gap-1.5">
            {(!isCollapsed || !isDesktop) && (
              <p className="px-3 text-[11px] font-mono tracking-widest uppercase text-[#9C928A] mb-1">
                Navigation
              </p>
            )}
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group relative flex items-center gap-3.5 p-3 rounded-xl transition-colors ${
                    isCollapsed && isDesktop ? "justify-center" : "px-3.5"
                  } ${
                    isActive
                      ? "bg-[#F2EFE9] text-[#2C2723] font-medium border border-[#E5E0D8]"
                      : "text-[#665E56] hover:bg-[#F6F4EF]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {(!isCollapsed || !isDesktop) && (
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

        {/* Epigraph */}
        {(!isCollapsed || !isDesktop) && (
          <div className="p-4 rounded-2xl bg-[#F5F2EB]/60 border border-[#EAE5DC]">
            <p className="font-serif text-xs italic text-[#5C544C]">
              &ldquo;Poetry is the rhythmical creation of beauty in words.&rdquo;
            </p>
            <span className="block mt-2 text-[10px] font-mono uppercase text-[#A3988E]">
              — Edgar Allan Poe
            </span>
          </div>
        )}
      </motion.aside>

      {/* Optimized Dynamic Navbar */}
      <motion.header
        initial={false}
        animate={{
          left: isDesktop ? (isCollapsed ? 80 : 288) : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 left-0 z-30 bg-[#FAF7F2]/85 backdrop-blur-md border-b border-[#EADFCF]/70 px-4 sm:px-8 py-3 flex items-center justify-between gap-2 sm:gap-4"
      >
        {/* Search Bar Container */}
        <div className="flex-1 max-w-md ml-12 lg:ml-0">
          {/* Mobile Expanded Overlay Search Bar */}
          <AnimatePresence>
            {isMobileSearchOpen && !isDesktop ? (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute inset-x-0 top-0 h-full bg-[#FAF7F2] px-4 flex items-center gap-2 z-50"
              >
                <Search className="w-4 h-4 text-[#8C827A] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search stanzas..."
                  className="w-full text-xs bg-transparent text-[#2C2A29] focus:outline-none"
                />
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="p-1 rounded-full text-[#8C827A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Regular Search Input */}
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-[#8C827A] pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search stanzas..."
              className="w-full pl-9 pr-4 sm:pr-12 py-1.5 sm:py-2 text-xs sm:text-sm bg-[#F3EFEA]/80 border border-[#E3D9CC] rounded-full text-[#2C2A29] placeholder-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#2C2A29]"
            />
            <kbd className="hidden sm:inline-flex absolute right-3 items-center px-1.5 py-0.5 text-[10px] font-mono text-[#8C827A] bg-[#E8E2D9]/60 border border-[#D8D2C6] rounded">
              /
            </kbd>
          </div>
        </div>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Link
            href="/share"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2C2A29] text-[#FAF8F5] text-xs font-serif hover:bg-[#3D3732] active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D8D2C6]" />
            <span>New Verse</span>
          </Link>

          <button
            onClick={() => setHasUnread(false)}
            className="relative p-2 rounded-full hover:bg-[#F3EFEA] text-[#4A423A]"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#8C3A32] ring-2 ring-[#FAF7F2]" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="h-8 w-8 rounded-full bg-[#E8E2D9] border border-[#D8D2C6] flex items-center justify-center font-serif text-xs text-[#2C2A29] active:scale-95 transition-transform"
            >
              ER
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#FAF8F5] border border-[#E3D9CC] shadow-lg p-1.5 z-50"
                  >
                    <div className="px-3 py-2 border-b border-[#E3D9CC]/60 mb-1">
                      <p className="font-serif text-xs font-medium text-[#2C2A29]">Elena Rostova</p>
                      <p className="text-[10px] text-[#8C827A] font-mono">@elena_rostova</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-[#5A5654] hover:bg-[#F3EFEA] rounded-xl"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Profile Sanctuary</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-[#5A5654] hover:bg-[#F3EFEA] rounded-xl"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Preferences</span>
                    </Link>
                    <div className="border-t border-[#E3D9CC]/60 my-1" />
                    <button
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#8C3A32] hover:bg-[#F3EFEA] rounded-xl"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>
    </>
  );
}