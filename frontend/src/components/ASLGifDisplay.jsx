import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const ASLGifDisplay = ({ text }) => {
  if (!text) return null;

  const words = text.split(/[\s-]+/);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(0);
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % words.length);
    }, 1500); // change every 1.5 sec
    return () => clearInterval(interval);
  }, [text]);

  const word = words[current];
  const gifPath = `/asl_gifs/${word}.gif`;


  const baseClass =
    
    " rounded-xl border border-neutral-700 overflow-hidden flex flex-col items-center justify-center h-full w-full transition-all duration-300 hover:border-neutral-500";



  return (
    <div className={`${baseClass} "bg-neutral-800"`}>
      <motion.img
        key={word}
        src={gifPath}
        alt={word}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-full w-full object-cover"
      />
      {/* <span className="text-neutral-200 text-lg mt-2">{word}</span> */}
    </div>
  );
};
