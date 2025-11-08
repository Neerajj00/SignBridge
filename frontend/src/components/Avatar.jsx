export const Avatar = ({ src, alt = "Avatar", fallback = "U", className = "" }) => {
  return (
    <div className={`relative rounded-full overflow-hidden bg-neutral-800 ${className}`}>
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-neutral-700 text-neutral-200 font-semibold">
          {fallback}
        </div>
      )}
    </div>
  );
};
