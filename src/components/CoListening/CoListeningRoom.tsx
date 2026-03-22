import { Users, Share2, X } from "lucide-react";
import { useState } from "react";
import FloatingEmoji from "./FloatingEmoji";

interface Listener {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

interface CoListeningRoomProps {
  roomId?: string;
  listeners?: Listener[];
  currentUserId?: string;
  onReact?: (emoji: string) => void;
  onInvite?: () => void;
  onLeave?: () => void;
}

const CoListeningRoom = ({
  roomId = `room-${Date.now()}`,
  listeners = [],
  currentUserId = "user-1",
  onReact,
  onInvite,
  onLeave,
}: CoListeningRoomProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<
    Array<{ id: string; emoji: string; x: number; y: number }>
  >([]);

  const emojis = ["😍", "🔥", "👏", "🎉", "😂", "💯", "🎧", "✨"];

  const handleEmojiReact = (emoji: string) => {
    const x = Math.random() * (window.innerWidth - 100) + 50;
    const y = Math.random() * 200 + 200;
    const id = `${Date.now()}-${Math.random()}`;

    setFloatingEmojis((prev) => [...prev, { id, emoji, x, y }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
    }, 2000);

    onReact?.(emoji);
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(`Join me in AudioFlix! Room: ${roomId}`);
    setShowMenu(false);
  };

  const isActive = listeners.length > 0;

  return (
    <>
      {/* Floating Emojis */}
      {floatingEmojis.map((item) => (
        <FloatingEmoji key={item.id} emoji={item.emoji} x={item.x} y={item.y} />
      ))}

      {/* Co-listening Bar */}
      <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
              isActive ? "bg-accent/20" : "bg-secondary/40"
            }`}>
              <Users className={`w-4 h-4 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
              <span className="text-sm font-semibold text-foreground">
                {listeners.length + 1} listening
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Room ID: {roomId.slice(-8)}</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors font-medium text-sm"
            >
              <Share2 className="w-4 h-4" />
              Invite Friends
            </button>

            {showMenu && (
              <div className="absolute right-0 top-12 bg-card border border-border/50 rounded-lg shadow-lg p-3 z-50 min-w-max animate-fade-in">
                <button
                  onClick={handleCopyInvite}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-secondary rounded transition-colors text-foreground mb-2"
                >
                  📋 Copy Invite Link
                </button>
                <button
                  onClick={onLeave}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-destructive/20 rounded transition-colors text-destructive"
                >
                  ✕ Leave Room
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active Listeners Avatars */}
        {listeners.length > 0 && (
          <div className="mb-4 pb-4 border-b border-border/40">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">
              Co-listeners
            </p>
            <div className="flex flex-wrap gap-2">
              {listeners.map((listener) => (
                <div
                  key={listener.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-secondary/40 backdrop-blur"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: listener.color }}
                  >
                    {listener.avatar}
                  </div>
                  <span className="text-xs font-medium text-foreground">{listener.name}</span>
                  {listener.id === currentUserId && (
                    <span className="text-[10px] text-accent font-semibold ml-1">(You)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emoji Reaction Buttons */}
        <div className="flex gap-2 flex-wrap">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiReact(emoji)}
              className="px-3 py-2 rounded-lg bg-secondary/60 hover:bg-accent/30 transition-all duration-200 text-lg hover:scale-110 transform"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {!isActive && (
          <div className="text-center mt-4 pt-4 border-t border-border/40">
            <p className="text-xs text-muted-foreground mb-3">
              No friends are listening yet. Invite someone to start a co-listening session!
            </p>
            <button
              onClick={onInvite}
              className="px-4 py-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors font-medium text-sm"
            >
              <Share2 className="w-4 h-4 inline mr-2" />
              Create & Share Room
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CoListeningRoom;
