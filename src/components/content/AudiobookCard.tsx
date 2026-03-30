import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Star, CheckCircle2 } from "lucide-react";
import { ContentItem } from "@/data/content";

interface AudiobookCardProps {
  item: ContentItem;
}

const AudiobookCard = ({ item }: AudiobookCardProps) => {
  const navigate = useNavigate();
  const author = item.author ?? "AudioFlix Narrator";
  const [isDownloaded, setIsDownloaded] = useState(false);

  useEffect(() => {
    const sync = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("audioflix-downloaded-ids") ?? "[]") as string[];
        setIsDownloaded(stored.includes(item.id));
      } catch {
        setIsDownloaded(false);
      }
    };

    sync();
    window.addEventListener("audioflix-downloads-updated", sync as EventListener);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("audioflix-downloads-updated", sync as EventListener);
      window.removeEventListener("storage", sync);
    };
  }, [item.id]);

  return (
    <button
      onClick={() => navigate(`/book/${item.id}`)}
      className="group relative w-40 sm:w-44 shrink-0 snap-start rounded-xl text-left focus:outline-none"
    >
      <div className="relative overflow-hidden rounded-xl aspect-[2/3] bg-muted card-shine border border-border/40">
        <img
          src={item.thumbnail}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity" />

        {item.rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-background/75 px-1.5 py-0.5 backdrop-blur-sm">
            <Star className="w-3 h-3 text-gold fill-current" />
            <span className="text-[10px] font-semibold text-foreground">{item.rating}</span>
          </div>
        )}

        {isDownloaded && (
          <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-success/20 text-success px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
            <CheckCircle2 className="w-3 h-3" />
            Saved
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
          <span className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center glow-primary">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </span>
        </div>
      </div>

      <p className="mt-2 text-sm font-semibold text-foreground truncate">{item.title}</p>
      <p className="text-xs text-muted-foreground truncate">{author}</p>
    </button>
  );
};

export default AudiobookCard;
