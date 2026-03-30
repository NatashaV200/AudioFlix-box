import { useNavigate } from "react-router-dom";
import { Play, Star } from "lucide-react";
import { ContentItem } from "@/data/content";

interface AudiobookCardProps {
  item: ContentItem;
}

const AudiobookCard = ({ item }: AudiobookCardProps) => {
  const navigate = useNavigate();
  const author = item.author ?? "AudioFlix Narrator";

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
