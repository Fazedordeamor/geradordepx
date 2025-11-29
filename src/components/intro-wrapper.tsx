"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function IntroWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showIntro, setShowIntro] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Sequence:
    // 0s: Logo starts appearing/zooming (handled by CSS animation)
    // 2.2s: Logo animation is near end (huge scale, 0 opacity)
    // 2.2s: Enable content visibility (fade in starts)
    // 2.5s: Remove intro DOM element entirely

    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 2000);

    const removeTimer = setTimeout(() => {
      setShowIntro(false);
    }, 2500);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#111827]">
          <img
            src="/logo-los-hermanos.png"
            alt="Intro Logo"
            className="w-48 md:w-64 animate-zoom-through drop-shadow-[0_0_25px_rgba(255,140,65,0.6)]"
          />
        </div>
      )}
      <div
        className={cn(
          "transition-opacity duration-1000",
          showContent ? "opacity-100 animate-fade-in-slow" : "opacity-0"
        )}
      >
        {children}
      </div>
    </>
  );
}