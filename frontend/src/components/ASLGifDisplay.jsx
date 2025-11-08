import React from "react";

/**
 * ASLOne
 * Displays ASL GIFs for a given text or concept.
 * Example:
 *   <ASLOne text="how are you" />
 *
 * GIFs must be stored in /public/asl_gifs/
 * Example folder:
 *   public/asl_gifs/how.gif, are.gif, you.gif
 */
export const ASLGifDisplay = ({ text }) => {
  if (!text) return null;

  // Break the text or phrase into words
  const words = text.toLowerCase().split(/[\s-]+/);

  return (
    <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-xl border border-neutral-700 p-6 flex flex-col items-center justify-center min-h-[280px] w-full shadow-md">

      <div className="flex flex-wrap justify-center gap-4">
        {words.map((word, index) => {
          const gifPath = `/asl_gifs/${word}.gif`;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-neutral-800 rounded-xl p-2 shadow-md flex flex-col items-center justify-center w-28 h-32 border border-neutral-700"
            >
              <img
                src={gifPath}
                alt={word}
                onError={(e) => (e.target.style.display = "none")}
                className="w-20 h-20 object-contain rounded-lg mb-1"
              />
              <span className="text-neutral-300 text-sm capitalize">
                {word}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
