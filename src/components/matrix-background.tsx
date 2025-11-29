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
      ctx.fillStyle = "rgba(6, 12, 6, 0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `17px var(--font-share-tech-mono, 'Share Tech Mono', monospace)`;

      for (let i = 0; i < drops.length; i++) {
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = i * columnWidth;
        const y = drops[i] * columnWidth;

        const flicker = Math.random();
        if (flicker > 0.92) {
          ctx.fillStyle = "rgba(120, 255, 180, 0.85)";
        } else if (flicker > 0.82) {
          ctx.fillStyle = "rgba(90, 240, 160, 0.7)";
        } else {
          ctx.fillStyle = "rgba(70, 200, 130, 0.55)";
        }

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i] += 0.25 + Math.random() * 0.2;
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
      className="fixed inset-0 -z-10 opacity-[0.55] pointer-events-none"
    />
  );
};

export default MatrixBackground;