export const Button = ({ 
  children, 
  onClick, 
  variant = "default", 
  size = "default",
  className = "",
  ...props 
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default:
      "bg-neutral-800 text-neutral-100 hover:bg-neutral-700",
    coral:
      "bg-neutral-700 text-neutral-100 hover:bg-neutral-600",
    outline:
      "border border-neutral-700 bg-neutral-900 text-neutral-100 hover:bg-neutral-800",
    ghost:
      "text-neutral-100 hover:bg-neutral-800",
  };

  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8 text-base",
    icon: "h-10 w-10",
  };

  const variantClass = variants[variant] || variants.default;
  const sizeClass = sizes[size] || sizes.default;

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
