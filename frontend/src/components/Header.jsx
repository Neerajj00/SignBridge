import { MessageSquare } from "lucide-react";
import { Avatar } from "./Avatar";

export const Header = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-neutral-900 border-b border-neutral-700">
      <div className="flex items-center gap-2">
        <img src="/LOGO-PNG.png" alt="Logo" className="h-12 w-auto invert" />
        <span className="text-xl font-semibold text-neutral-100">
          SignBridge
        </span>
      </div>
    </header>
  );
};
