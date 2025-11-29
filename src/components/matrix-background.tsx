"use client";

import React, { useEffect, useRef } from "react";

const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const columnWidth = 18;
    const characters =
      "01∑≡≠→←⇐⇑⇓⇔∴∵∀∃∂∞ΩλπΔΣΞΦΨΓαβγδεζηθικλμνξοπρστυφχψω";

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();

    let columns = Math.floor(canvas.width / columnWidth);
    let drops = Array.from({ length: columns }, () => Math.random() * canvas.height);

    const draw = () => {
      ctx.fillStyle = "rgba(12, 12, 16, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `16px var(--font-share-tech-mono, 'Share Tech Mono', monospace)`;

      for (let i = 0; i < drops.length; i++) {
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = i * columnWidth;
        const y = drops[i] * columnWidth;

        const flicker = Math.random();
        if (flicker > 0.92) {
          ctx.fillStyle = "rgba(255, 149, 64, 0.75)"; // neon orange accents
        } else if (flicker > 0.85) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.55)"; // brighter white flashes
        } else {
          ctx.fillStyle = "rgba(233, 233, 233, 0.35)"; // soft white stream
        }

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i] += 0.9 + Math.random() * 0.5;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      setCanvasSize();
      columns = Math.floor(canvas.width / columnWidth);
      drops = Array.from({ length: columns }, () => Math.random() * canvas.height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 opacity-[0.35] pointer-events-none"
    />
  );
};

export default MatrixBackground;