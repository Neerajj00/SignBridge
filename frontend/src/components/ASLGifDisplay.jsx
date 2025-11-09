import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// all available GIFs (for safety fallback checking)
const availableGifs = [
  "ANGRY", "BAD", "BYE", "COME-GO", "CONGRATULATIONS", "DAY", "DRINK", "EAT",
  "EXCITED", "FAMILY", "FRIEND", "GOOD-MORNING", "GOOD", "HAPPY", "HAVE", "HELLO",
  "HELP", "HUNGRY", "I-LOVE-YOU", "I-AM", "KNOW", "LATER", "LEARN", "LIKE",
  "MAYBE", "MORNING", "MY", "NEED", "NIGHT", "NO", "NOT-LIKE", "NOW", "PLAY",
  "PLEASE", "SAD", "SEE-YOU-LATER", "SEE", "SIT", "SLEEP", "SORRY", "STAND",
  "STOP", "SURPRISE", "THANKYOU", "TIRED", "TOMORROW", "UNDERSTAND", "WAIT",
  "WANT", "WE", "WELCOME", "WORK", "YES", "YOU", "YOUR"
];

export const ASLGifDisplay = ({ text }) => {
  if (!text) return null;

  // Split on spaces only — keep hyphenated words together
  const words = text.split(/\s+/).map(w => w.toUpperCase());
  const [current, setCurrent] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setCurrent(0);
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % words.length);
      setImageError(false);
    }, 1500);
    return () => clearInterval(interval);
  }, [text]);

  const word = words[current];

  // find the most likely gif
  let gifName = availableGifs.find(g => g === word);
  if (!gifName) {
    // try to find compound words that contain this as part
    gifName = availableGifs.find(g => g.includes(word));
  }

  const gifPath = gifName ? `/asl_gifs/${gifName}.gif` : null;

  const baseClass =
    "rounded-xl border border-neutral-700 overflow-hidden flex flex-col items-center justify-center h-full w-full transition-all duration-300 hover:border-neutral-500 bg-neutral-800";

  return (
    <div className={baseClass}>
      {gifPath && !imageError ? (
        <motion.img
          key={gifName}
          src={gifPath}
          alt={gifName}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="h-full w-full object-contain"
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
