import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const ASLGifDisplay = ({ text }) => {
  if (!text) return null;

  const words = text.split(/[\s-]+/);
  const [current, setCurrent] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setCurrent(0);
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % words.length);
      setImageError(false); // reset error when switching to next word
    }, 1500);
    return () => clearInterval(interval);
  }, [text]);

  const word = words[current];
  const gifPath = `/asl_gifs/${word}.gif`;

  const baseClass =
    "rounded-xl border border-neutral-700 overflow-hidden flex flex-col items-center justify-center h-full w-full transition-all duration-300 hover:border-neutral-500 bg-neutral-800";

  return (
    <div className={baseClass}>
      {!imageError ? (
        <motion.img
          key={word}
          src={gifPath}
          alt={word}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <motion.div
          key={word + "-fallback"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center h-full w-full p-6 text-center text-lg sm:text-xl text-neutral-300"
        >
          {word}
        </motion.div>
      )}
    </div>
  );
};
