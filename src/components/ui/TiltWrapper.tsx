'use client'
import React from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion';
import { cn } from "@/lib/utils";

interface TiltWrapperProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export const TiltWrapper = ({ children, className, intensity = 3 }: TiltWrapperProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  // Física natural: stiffness alta para resposta rápida, damping baixo para bounce sutil, mass para inércia
  const tiltSpring = { damping: 18, stiffness: 250, mass: 0.6 };
  const mouseXSpring = useSpring(x, tiltSpring);
  const mouseYSpring = useSpring(y, tiltSpring);
  const scaleSpring = useSpring(scale, { damping: 22, stiffness: 320, mass: 0.4 });

  // Lado hovado afunda (efeito de peso)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-intensity, intensity]);

  const shineX = useTransform(mouseXSpring, [-0.5, 0.5], [100, 0]);
  const shineY = useTransform(mouseYSpring, [-0.5, 0.5], [100, 0]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    scale.set(1.01);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    scale.set(1);
  };

  return (
    // perspective no pai para distorção 3D correta
    <div style={{ perspective: "1200px" }} className={cn("relative group", className)}>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          scale: scaleSpring,
          transformStyle: "preserve-3d",
          willChange: "auto",
          backfaceVisibility: "hidden",
          "--tilt-x": shineX,
          "--tilt-y": shineY
        } as any}
        className="relative h-full w-full"
      >
        <div className="relative z-10 h-full w-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
};
