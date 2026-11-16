// components/hero-background.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

export function HeroBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Slowly Drifting Grid */}
      <motion.div
        animate={{ backgroundPosition: ["0px 0px", "32px 32px"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,#000_70%,transparent_100%)]"
      />

      {/* Interactive Mouse & Scroll Spotlight Glow */}
      <motion.div
        className="absolute h-[500px] w-[500px] rounded-full bg-gradient-to-r from-red-500/25 via-red-500/20 to-black/25 blur-[100px]"
        animate={{
          x: mousePosition.x - 250,
          y: mousePosition.y - 250 + scrollY * 0.4,
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 200,
          mass: 0.5,
        }}
      />

      {/* Stronger Animated Indigo Orb */}
      <motion.div
        animate={{
          x: [-40, 80, -40],
          y: [-20, 40, -20],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-20 left-1/4 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-red-300/10 blur-3xl"
      />

      {/* Stronger Animated Sky/Cyan Orb */}
      <motion.div
        animate={{
          x: [40, -80, 40],
          y: [20, -40, 20],
          scale: [1.1, 0.9, 1.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-10 right-1/4 h-[28rem] w-[28rem] translate-x-1/2 rounded-full bg-white/10 blur-3xl"
      />

      {/* Falling Grid Beams */}
      {[15, 35, 55, 75, 88].map((leftPercent, i) => (
        <motion.div
          key={i}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "500%", opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 3.5 + i * 0.7,
            repeat: Infinity,
            delay: i * 1.2,
            ease: "linear",
          }}
          style={{ left: `${leftPercent}%` }}
          className="absolute top-0 h-24 w-[1px] bg-gradient-to-b from-transparent via-white to-transparent"
        />
      ))}
    </div>
  );
}
