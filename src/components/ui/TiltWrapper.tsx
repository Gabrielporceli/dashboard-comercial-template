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

export const TiltWrapper = ({ children, className, intensity = 10 }: TiltWrapperProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth the rotation with spring - high damping and lower stiffness for "suave" effect
  const springConfig = { damping: 35, stiffness: 100 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  // CORRECT DIRECTION: Hovered side comes TOWARDS the user
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [-intensity, intensity]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [intensity, -intensity]);

  // OPPOSITE AXIS: Mapping [-0.5, 0.5] -> [100, 0] to move shine away from mouse
  const shineX = useTransform(mouseXSpring, [-0.5, 0.5], [100, 0]);
  const shineY = useTransform(mouseYSpring, [-0.5, 0.5], [100, 0]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
        // Passing JS variables to CSS
        "--tilt-x": shineX,
        "--tilt-y": shineY
      } as any}
      className={cn("relative group", className)}
    >
      <div style={{ transform: "translateZ(15px)", transformStyle: "preserve-3d" }} className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
};
