"use client";

import type * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--sm-obsidian-2)",
          "--normal-text": "#f5f5f7",
          "--normal-border": "var(--sm-obsidian-border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };
