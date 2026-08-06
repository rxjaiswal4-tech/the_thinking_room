"use client";

import React, { useState } from "react";
import { Navigation } from "../components/Navigation";

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  // Default to true to match Navigation's initial collapsed state
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2723] relative">
      {/* Sidebar & Fixed Top Navigation */}
      <Navigation onCollapseChange={(collapsed) => setIsCollapsed(collapsed)} />

      {/* 
        Main Content Area 
        - Dynamic left padding matches sidebar state (lg:pl-20 vs lg:pl-72)
        - Block container prevents flex item collapsing on Vercel builds
      */}
      <div
        className={`w-full min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          {children}
        </main>
      </div>
    </div>
  );
}