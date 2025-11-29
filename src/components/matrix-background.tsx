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

    const columnWidth = 20;
    const characters =
      "01ΛΣΓΞΦΨΩαβγδεζηθικλμνξοπρστυφχψω";

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();

    let columns = Math.floor(canvas.width / columnWidth);
    let drops = Array.from({ length: columns }, () => Math.random() * canvas.height);

    const draw = () => {
      ctx.fillStyle = "rgba(4, 10, 6, 0.14)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `17px var(--font-share-tech-mono, 'Share Tech Mono', monospace)`;

      for (let i = 0; i < drops.length; i++) {
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = i * columnWidth;
        const y = drops[i] * columnWidth;

        const choice = Math.random();
        if (choice < 0.45) {
          ctx.fillStyle = "rgba(120, 255, 190, 0.9)"; // vibrant green
        } else if (choice < 0.85) {
          ctx.fillStyle = "rgba(170, 125, 255, 0.85)"; // vivid purple
        } else {
          ctx.fillStyle = "rgba(255, 170, 90, 0.35)"; // soft orange accent
        }

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i] += 0.12 + Math.random() * 0.08;
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
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 opacity-45">
        <div className="absolute top-1/2 left-1/2 w-[140vw] h-[140vw] -translate-x-1/2 -translate-y-1/2 rounded-[45%] bg-[radial-gradient(circle_at_center,rgba(255,140,65,0.22)_0%,rgba(255,140,65,0)_70%)] blur-2xl animate-geometry-sway" />
        <div className="absolute top-1/2 left-1/2 w-[110vw] h-[110vw] -translate-x-1/2 -translate-y-1/2 border border-primary/25 rounded-[35%] rotate-6 blur-[2px] animate-geometry-glide" />
      </div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-[0.78]"
      />
    </div>
  );
};

export default MatrixBackground;