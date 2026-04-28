'use client'; 

import React from "react";
import { motion } from "framer-motion";

const LoadingPage = () => {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#FAF7F2]">
      <div className="relative flex flex-col items-center">
        
       
        <motion.h1
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.4em" }}
          transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          className="text-4xl font-light uppercase text-zinc-900 mb-12 font-sans"
        >
          Glowly
        </motion.h1>

       
        <div className="relative w-24 h-[1px] bg-zinc-200 overflow-hidden">
       
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
            className="absolute h-full w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent"
          />
        </div>

      
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex flex-col items-center gap-2"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-semibold">
            Pure Korean Wisdom
          </p>
          
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                className="w-1 h-1 bg-zinc-800 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>

 
      <div className="absolute bottom-10 text-[10px] text-zinc-300 uppercase tracking-widest font-medium">
        Sustainability & Curtify
      </div>
    </div>
  );
};

export default LoadingPage;