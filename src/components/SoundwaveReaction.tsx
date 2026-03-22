import { useState } from "react";

interface SoundwaveReactionProps {
  onReact?: () => void;
  size?: "sm" | "md" | "lg";
  isReacted?: boolean;
}

const SoundwaveReaction = ({ onReact, size = "md", isReacted = false }: SoundwaveReactionProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasReacted, setHasReacted] = useState(isReacted);

  const handleClick = () => {
    setHasReacted(!hasReacted);
    onReact?.();
  };

  const sizeMap = {
    sm: { container: "w-12 h-12", bar: "h-1", gap: "gap-0.5" },
    md: { container: "w-16 h-16", bar: "h-2", gap: "gap-1" },
    lg: { container: "w-20 h-20", bar: "h-2.5", gap: "gap-1.5" },
  };

  const { container, bar, gap } = sizeMap[size];
  const barCounts = 5;
  const isActive = isHovered || hasReacted;

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex items-center justify-center transition-all duration-300 ${container} rounded-full ${
        hasReacted ? "bg-accent/20" : "bg-secondary/40"
      } hover:bg-accent/30 group`}
      aria-label="React with soundwave"
    >
      <div className={`flex items-center justify-center ${gap}`}>
        {Array.from({ length: barCounts }).map((_, i) => {
          const centerDistance = Math.abs(i - (barCounts - 1) / 2);
          const delay = centerDistance * 0.05;

          return (
            <div
              key={i}
              className={`${bar} w-1 bg-gradient-to-t from-accent to-accent/60 rounded-full transition-all duration-300 ${
                isActive ? "opacity-100" : "opacity-50"
              }`}
              style={{
                animation: isActive
                  ? `soundwave-spike 0.6s ease-in-out infinite ${delay}s`
                  : "soundwave-idle 0.8s ease-in-out infinite",
              }}
            />
          );
        })}
      </div>

      <style>{`
        @keyframes soundwave-spike {
          0%, 100% { transform: scaleY(0.3); opacity: 0.8; }
          50% { transform: scaleY(1.2); opacity: 1; }
        }

        @keyframes soundwave-idle {
          0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
          50% { transform: scaleY(0.7); opacity: 0.7; }
        }
      `}</style>

      {hasReacted && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-accent bg-background/90 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Reacted ✓
        </div>
      )}
    </button>
  );
};

export default SoundwaveReaction;
