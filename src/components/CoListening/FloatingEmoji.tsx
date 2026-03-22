import { useEffect, useState } from "react";

interface FloatingEmojiProps {
  emoji: string;
  x: number;
  y: number;
  duration?: number;
}

const FloatingEmoji = ({ emoji, x, y, duration = 2000 }: FloatingEmojiProps) => {
  const [remove, setRemove] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRemove(true), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (remove) return null;

  return (
    <div
      className="fixed pointer-events-none select-none"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        fontSize: "2.5rem",
        animation: `float-emoji ${duration}ms ease-out forwards`,
        zIndex: 40,
      }}
    >
      {emoji}
      <style>{`
        @keyframes float-emoji {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(0.5);
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingEmoji;
