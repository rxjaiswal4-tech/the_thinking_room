"use client";

import React, { useState } from "react";
import { Navigation } from "../components/Navigation";

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Default to true to match Navigation's initial collapsed state
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-[#F7F5F1]">
      {/* Sidebar & Fixed Top Navigation */}
      <Navigation
        onCollapseChange={(collapsed) => setIsCollapsed(collapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`w-full min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        {/*
          Increased width:
          - max-w-6xl = 1152px
          - max-w-7xl = 1280px
          - max-w-[1400px] = custom wider width
        */}
        <main className="w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-10 pt-24 pb-16">
          {children}
        </main>
      </div>
    </div>
  );
}