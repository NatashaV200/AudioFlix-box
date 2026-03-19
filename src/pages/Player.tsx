import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { contentData } from "@/data/content";
import { ArrowLeft, Headphones, Star, Clock, Tag } from "lucide-react";

const Player = () => {
  const { id } = useParams<{ id: string }>();
  const item = contentData.find((c) => c.id === id);

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-6">
            <span className="text-3xl">🎬</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">Content Not Found</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            The content you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Content
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 max-w-5xl mx-auto px-4">
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </Link>

        {/* Player */}
        <div className="rounded-2xl overflow-hidden bg-card border border-border/50 card-shine">
          {item.type === "video" ? (
            <video
              controls
              className="w-full aspect-video bg-muted"
              poster={item.thumbnail}
              src={item.src}
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <div className="relative flex flex-col items-center justify-center py-20 gap-8">
              <div className="absolute inset-0 opacity-20">
                <img src={item.thumbnail} alt="" className="w-full h-full object-cover blur-3xl" />
              </div>
              <div className="relative">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-48 h-48 md:w-56 md:h-56 rounded-2xl object-cover shadow-2xl shadow-primary/20"
                />
              </div>
              <audio controls className="relative w-full max-w-lg" src={item.src}>
                Your browser does not support audio playback.
              </audio>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {item.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {item.rating && (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-gold bg-gold/10 px-3 py-1.5 rounded-lg">
                <Star className="w-4 h-4 fill-current" />
                {item.rating}
              </span>
            )}
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg ${
              item.type === "audio" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
            }`}>
              {item.type === "audio" ? "Audiobook" : "Video"}
            </span>
            {item.year && (
              <span className="text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
                {item.year}
              </span>
            )}
            {item.duration && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                {item.duration}
              </span>
            )}
            {item.genre && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
                <Tag className="w-3.5 h-3.5" />
                {item.genre}
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Player;
