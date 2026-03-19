import { useNavigate } from "react-router-dom";
import { ContentItem } from "@/data/content";
import { Play, Headphones, Star } from "lucide-react";

interface ContentCardProps {
  item: ContentItem;
  variant?: "poster" | "wide";
}

const ContentCard = ({ item, variant = "poster" }: ContentCardProps) => {
  const navigate = useNavigate();

  if (variant === "wide") {
    return (
      <button
        onClick={() => navigate(`/player/${item.id}`)}
        className="group flex-shrink-0 w-72 sm:w-80 cursor-pointer focus:outline-none rounded-xl"
      >
        <div className="relative overflow-hidden rounded-xl aspect-video bg-muted card-shine transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-2xl group-hover:shadow-primary/10">
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
            <div className="flex items-center gap-2 mt-1">
              {item.rating && (
                <span className="flex items-center gap-1 text-xs text-gold">
                  <Star className="w-3 h-3 fill-current" />
                  {item.rating}
                </span>
              )}
              {item.year && <span className="text-xs text-muted-foreground">{item.year}</span>}
              {item.genre && <span className="text-xs text-muted-foreground">• {item.genre}</span>}
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/90 backdrop-blur flex items-center justify-center glow-primary transition-transform group-hover:scale-110">
              {item.type === "audio" ? (
                <Headphones className="w-5 h-5 text-primary-foreground" />
              ) : (
                <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
              )}
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate(`/player/${item.id}`)}
      className="group flex-shrink-0 w-36 sm:w-40 md:w-44 cursor-pointer focus:outline-none rounded-xl"
    >
      <div className="relative overflow-hidden rounded-xl aspect-[2/3] bg-muted card-shine transition-all duration-500 group-hover:scale-[1.05] group-hover:shadow-2xl group-hover:shadow-primary/10">
        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating badge */}
        {item.rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/70 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <Star className="w-3 h-3 text-gold fill-current" />
            <span className="text-[10px] font-semibold text-foreground">{item.rating}</span>
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
            item.type === "audio" ? "bg-accent/80 text-accent-foreground" : "bg-primary/80 text-primary-foreground"
          } backdrop-blur-sm`}>
            {item.type}
          </span>
        </div>

        {/* Hover play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-11 h-11 rounded-full bg-primary/90 backdrop-blur flex items-center justify-center glow-primary">
            {item.type === "audio" ? (
              <Headphones className="w-5 h-5 text-primary-foreground" />
            ) : (
              <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
            )}
          </div>
        </div>

        {/* Bottom info on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1.5 text-[10px] text-foreground/80">
            {item.year && <span>{item.year}</span>}
            {item.duration && <span>• {item.duration}</span>}
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs font-semibold text-foreground truncate text-left">
        {item.title}
      </p>
      {item.genre && (
        <p className="text-[10px] text-muted-foreground text-left">{item.genre}</p>
      )}
    </button>
  );
};

export default ContentCard;
