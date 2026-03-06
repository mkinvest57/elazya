"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function GlassBackground() {
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Grid pattern to match the reference composition (1: glass cube, 0: empty)
  // Designed for an 11-column grid
  const gridPattern = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 0
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 1
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 2
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 3
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Row 4
    [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1], // Row 5
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1], // Row 6
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Row 7
  ];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#f8fbff] grain-light">
      {/* 1. Underlying Color Blobs */}
      <div className="absolute inset-0 flex items-center justify-center opacity-70">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.5, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] left-[5%] w-[600px] h-[600px] rounded-full bg-blue-400 blur-[130px] mix-blend-multiply" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-purple-400 blur-[120px] mix-blend-multiply" 
        />
        <motion.div 
          animate={{ x: [0, 20, 0], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[30%] right-[25%] w-[400px] h-[400px] rounded-full bg-pink-300 blur-[100px] mix-blend-multiply" 
        />
      </div>

      {/* 2. Glass Cubes Grid */}
      <div className="absolute inset-0 flex items-end justify-center pb-0">
        <div className="w-full max-w-[1400px] px-4 md:px-8 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-2 sm:gap-4 md:gap-5 pb-8 relative -bottom-10">
          {gridPattern.map((row, rIndex) => (
            row.map((item, cIndex) => {
              // Create a consistent stagger delay based on position
              const delay = (rIndex * 0.05) + (cIndex * 0.02);
              
              if (item === 1) {
                return (
                  <motion.div
                    key={`${rIndex}-${cIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay, ease: [0.2, 0.8, 0.2, 1] }}
                    className="aspect-square rounded-2xl md:rounded-3xl glass-cube glass-cube-hover relative overflow-hidden"
                  >
                     {/* Inner glowing edge simulation for the glass */}
                     <div className="absolute inset-0 rounded-2xl md:rounded-3xl pointer-events-none" style={{
                       boxShadow: 'inset 0px 4px 10px rgba(255,255,255,0.8)'
                     }} />
                  </motion.div>
                );
              }
              // Render an empty invisible placeholder to maintain grid alignment
              return <div key={`${rIndex}-${cIndex}`} className="aspect-square opacity-0" />;
            })
          ))}
        </div>
      </div>
    </div>
  )
}
