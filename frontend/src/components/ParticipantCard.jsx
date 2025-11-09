import { motion } from "framer-motion";

export const ParticipantCard = ({ 
  name, 
  icon, 
  imageSrc, 
  isAI = false,
  isSpeaking = false,
  className = ""
}) => {
  const baseClass =
    " rounded-xl border border-neutral-700 p-8 flex flex-col items-center justify-center h-full transition-all duration-300 hover:border-neutral-500";

  const bgClass = isAI
    ? "bg-gradient-to-br from-neutral-800 to-neutral-700"
    : "bg-neutral-800";

  return (
    <div className={`${baseClass} ${bgClass} ${className}`}>
      <div className="relative mb-6">
        {/* Speaking bubble animation */}
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-full bg-green-400 opacity-40"
            initial={{ scale: 0.7 }}
            animate={{ scale: [0.7, 1, 0.7], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <div
          className={`relative w-24 h-24 rounded-full flex items-center justify-center ${
            isAI ? "bg-neutral-700" : "overflow-hidden"
          }`}
        >
          {icon && <div className="text-4xl text-neutral-100 z-10">{icon}</div>}
          {imageSrc && !icon && (
            <img
              src={imageSrc}
              alt={name}
              className="w-full h-full object-cover z-10"
            />
          )}
        </div>
      </div>

      <h3 className="text-xl font-medium text-neutral-100">{name}</h3>
    </div>
  );
};
