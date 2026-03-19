import { useNavigate } from "react-router-dom";
import { ContentItem } from "@/data/content";
import { Play, Headphones, Star, Info } from "lucide-react";

interface HeroBannerProps {
  item: ContentItem;
}

const HeroBanner = ({ item }: HeroBannerProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Background image */}
      <img
        src={item.thumbnail}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end pb-24 md:pb-32">
        <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-8 animate-fade-in-up">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-widest bg-primary/90 text-primary-foreground px-3 py-1 rounded-md">
              Featured
            </span>
            {item.rating && (
              <span className="flex items-center gap-1 text-xs font-semibold text-gold bg-background/40 backdrop-blur-sm px-2 py-1 rounded-md">
                <Star className="w-3 h-3 fill-current" />
                {item.rating}
              </span>
            )}
            {item.genre && (
              <span className="text-xs text-foreground/70 bg-background/30 backdrop-blur-sm px-2 py-1 rounded-md">
                {item.genre}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-[0.95] max-w-2xl">
            {item.title}
          </h1>

          <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
            {item.year && <span>{item.year}</span>}
            {item.duration && <span>• {item.duration}</span>}
            <span>• {item.type === "audio" ? "Audiobook" : "Video"}</span>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => navigate(`/player/${item.id}`)}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-7 py-3 rounded-xl hover:bg-primary/90 transition-all duration-200 glow-primary"
            >
              {item.type === "audio" ? (
                <Headphones className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
              {item.type === "audio" ? "Listen Now" : "Play Now"}
            </button>
            <button
              onClick={() => navigate(`/player/${item.id}`)}
              className="flex items-center gap-2 bg-secondary/80 backdrop-blur text-foreground font-medium px-6 py-3 rounded-xl hover:bg-secondary transition-colors"
            >
              <Info className="w-5 h-5" />
              More Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
