import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Star, CheckCircle2 } from "lucide-react";
import { ContentItem } from "@/data/content";

interface AudiobookCardProps {
  item: ContentItem;
  isLoading?: boolean;
}

const AudiobookCard = ({ item, isLoading = false }: AudiobookCardProps) => {
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

  if (isLoading) {
    return (
      <div className="group relative w-40 sm:w-44 shrink-0 snap-start rounded-xl">
        <div className="w-40 sm:w-44 aspect-[2/3] bg-muted rounded-xl animate-pulse" />
        <div className="mt-2">
          <div className="h-4 w-full bg-muted rounded animate-pulse mb-2" />
          <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => navigate(`/book/${item.id}`)}
      className="group relative w-40 sm:w-44 shrink-0 snap-start rounded-xl text-left focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`${item.title} by ${author}, rating ${item.rating || "not rated"}`}
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
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-background/75 px-1.5 py-0.5 backdrop-blur-sm" aria-label={`Rating: ${item.rating}`}>
            <Star className="w-3 h-3 text-gold fill-current" />
            <span className="text-[10px] font-semibold text-foreground">{item.rating}</span>
          </div>
        )}

        {isDownloaded && (
          <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-success/20 text-success px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur-sm" title="This book is saved for offline listening">
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
