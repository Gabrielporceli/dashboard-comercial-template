'use client'
import React from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion';
import { cn } from "@/lib/utils";
import { useMotion } from "@/contexts/MotionContext";

interface TiltWrapperProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export const TiltWrapper = ({ children, className, intensity = 4 }: TiltWrapperProps) => {
  const { animationsEnabled } = useMotion();
  
  // Motion Values para a posição bruta do mouse
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const scale = useMotionValue(1);

  // Springs para suavização
  const xSpring = useSpring(x, { damping: 25, stiffness: 200 });
  const ySpring = useSpring(y, { damping: 25, stiffness: 200 });
  const scaleSpring = useSpring(scale, { damping: 25, stiffness: 200 });

  // Transformações baseadas nas molas
  const rotateX = useTransform(ySpring, [0, 1], [intensity, -intensity]);
  const rotateY = useTransform(xSpring, [0, 1], [-intensity, intensity]);

  // Efeito de brilho dinâmico no lado OPOSTO (para profundidade premium)
  const shineX = useTransform(xSpring, [0, 1], [100, 0]);
  const shineY = useTransform(ySpring, [0, 1], [100, 0]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!animationsEnabled) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalizar para 0-1
    x.set(mouseX / rect.width);
    y.set(mouseY / rect.height);
  };

  const handleMouseEnter = () => {
    if (animationsEnabled) {
      scale.set(1.02);
    }
  };

  const handleMouseLeave = () => {
    // Retornar ao centro de forma suave
    x.set(0.5);
    y.set(0.5);
    scale.set(1);
  };

  // Se as animações forem desligadas, resetamos os valores de entrada
  React.useEffect(() => {
    if (!animationsEnabled) {
      x.set(0.5);
      y.set(0.5);
      scale.set(1);
    }
  }, [animationsEnabled, x, y, scale]);

  return (
    <div 
      className={cn("relative h-full w-full", className)}
      style={{ perspective: "1500px" }}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          scale: scaleSpring,
          transformStyle: "preserve-3d",
          // Passamos os valores das molas para as variáveis CSS
          "--tilt-x": animationsEnabled ? shineX : 50,
          "--tilt-y": animationsEnabled ? shineY : 50,
        } as any}
        className="relative h-full w-full will-change-transform"
      >
        <div className="relative z-10 h-full w-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
};
