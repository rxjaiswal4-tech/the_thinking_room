export const dynamic = "force-dynamic";

import React from "react";
import FeedLayoutClient from "./FeedLayoutClient";

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FeedLayoutClient>{children}</FeedLayoutClient>;
}