import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ReportsButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate('/reports')}
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
      aria-label="Dashboard de Relatórios"
    >
      <div className="relative w-6 h-6 flex-shrink-0 flex items-center justify-center">
        <BarChart3 className="w-6 h-6 text-goat-purple drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
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
                Dashboard
              </span>
              <span className="text-sm font-bold text-white transition-colors duration-300">
                Relatórios
              </span>
            </div>

            <div className="w-6 h-6 rounded-lg transition-all duration-500 flex items-center justify-center bg-white/5 border border-white/10 group-hover:bg-goat-purple group-hover:shadow-[0_0_12px_rgba(168,85,247,0.5)]">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
