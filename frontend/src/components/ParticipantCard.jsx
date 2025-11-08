export const ParticipantCard = ({ 
  name, 
  icon, 
  imageSrc, 
  isAI = false,
  className = ""
}) => {
  const baseClass =
    "relative rounded-xl border border-neutral-700 p-8 flex flex-col items-center justify-center min-h-[280px] transition-all duration-300 hover:border-neutral-500";

  const bgClass = isAI
    ? "bg-gradient-to-br from-neutral-800 to-neutral-700"
    : "bg-neutral-800";

  return (
    <div className={`${baseClass} ${bgClass} ${className}`}>
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
          isAI ? "bg-neutral-700" : "overflow-hidden"
        }`}
      >
        {icon && <div className="text-4xl text-neutral-100">{icon}</div>}
        {imageSrc && !icon && (
          <img
            src={imageSrc}
            alt={name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <h3 className="text-xl font-medium text-neutral-100">{name}</h3>
    </div>
  );
};
