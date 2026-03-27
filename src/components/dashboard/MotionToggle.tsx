import React, { useState, useEffect } from 'react';
import { useMotion } from '@/contexts/MotionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ZapOff, Check } from 'lucide-react';

export const MotionToggle = () => {
  const { animationsEnabled, toggleAnimations } = useMotion();
  const [isExpanded, setIsExpanded] = useState(false);

  // Fecha o menu após 2.5 segundos de inatividade expandida
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const handleToggle = () => {
    toggleAnimations();
    setIsExpanded(true);
  };

  return (
    <div className="fixed top-8 left-8 z-[100]">
      <motion.button
        onClick={handleToggle}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        layout
        initial={false}
        animate={{ 
          width: isExpanded ? "auto" : "56px",
          paddingLeft: "16px",
          paddingRight: isExpanded ? "20px" : "16px"
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25,
          layout: { duration: 0.3 }
        }}
        className="liquid-glass h-14 rounded-2xl overflow-hidden border border-white/20 hover:scale-[1.02] active:scale-95 shadow-2xl flex items-center gap-4 backdrop-blur-2xl group cursor-pointer"
        aria-label={animationsEnabled ? "Desativar animações" : "Ativar animações"}
      >
        <div className="relative w-6 h-6 flex-shrink-0 flex items-center justify-center">
          <motion.div
            initial={false}
            animate={{ 
              scale: animationsEnabled ? 1 : 0,
              opacity: animationsEnabled ? 1 : 0,
              rotate: animationsEnabled ? 0 : 45
            }}
            className="absolute inset-0"
          >
            <Zap className="w-6 h-6 text-goat-purple drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
          </motion.div>
          
          <motion.div
            initial={false}
            animate={{ 
              scale: animationsEnabled ? 0 : 1,
              opacity: animationsEnabled ? 0 : 1,
              rotate: animationsEnabled ? -45 : 0
            }}
            className="absolute inset-0"
          >
            <ZapOff className="w-6 h-6 text-muted-foreground" />
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-4 whitespace-nowrap overflow-hidden"
            >
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 mb-0.5">
                  Animações
                </span>
                <span className={`text-sm font-bold transition-colors duration-300 ${animationsEnabled ? 'text-white' : 'text-muted-foreground/60'}`}>
                  {animationsEnabled ? 'Ativadas' : 'Desativadas'}
                </span>
              </div>

              {/* Checkbox Visual Minimalista */}
              <div className={`w-6 h-6 rounded-lg transition-all duration-500 flex items-center justify-center ${animationsEnabled ? 'bg-goat-purple shadow-[0_0_12px_rgba(168,85,247,0.5)]' : 'bg-white/5 border border-white/10'}`}>
                <AnimatePresence>
                  {animationsEnabled && (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: -45 }}
                    >
                      <Check className="w-4 h-4 text-white stroke-[3px]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
