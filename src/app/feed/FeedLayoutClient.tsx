"use client";

import React, { useState } from "react";
import { Navigation } from "../components/Navigation";

export default function FeedLayoutClient({
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
        <main className="w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-10 pt-12 pb-16">
          {children}
        </main>
      </div>
    </div>
  );
}