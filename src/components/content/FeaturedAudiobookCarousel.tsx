import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { ContentItem } from "@/data/content";

interface FeaturedAudiobookCarouselProps {
  items: ContentItem[];
}

const FeaturedAudiobookCarousel = ({ items }: FeaturedAudiobookCarouselProps) => {
  const navigate = useNavigate();
  const featured = useMemo(() => items.slice(0, 5), [items]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % featured.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) return null;

  const current = featured[index];

  return (
    <section className="relative h-[58vh] min-h-[360px] max-h-[620px] overflow-hidden">
      <img
        src={current.thumbnail}
        alt={current.title}
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

      <div className="relative h-full max-w-[1440px] mx-auto px-4 lg:px-8 flex items-end pb-12">
        <div className="max-w-2xl animate-fade-in-up">
          <span className="inline-flex items-center rounded-md bg-accent/20 text-accent px-3 py-1 text-xs font-semibold tracking-wide uppercase">
            Featured Audiobook
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-display font-bold text-foreground leading-tight">
            {current.title}
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">
            {current.author ?? "AudioFlix Narrator"} • {current.genre ?? "Audiobook"}
          </p>

          <button
            onClick={() => navigate(`/player/${current.id}`)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-3 font-semibold hover:bg-primary/90 transition-colors glow-primary"
          >
            <Play className="w-5 h-5 fill-current" />
            Play Now
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
        {featured.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setIndex(i)}
            className={`h-2.5 rounded-full transition-all ${i === index ? "w-8 bg-primary" : "w-2.5 bg-foreground/40"}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <button
        onClick={() => setIndex((prev) => (prev - 1 + featured.length) % featured.length)}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/60 text-foreground items-center justify-center hover:bg-background/80"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => setIndex((prev) => (prev + 1) % featured.length)}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/60 text-foreground items-center justify-center hover:bg-background/80"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </section>
  );
};

export default FeaturedAudiobookCarousel;
