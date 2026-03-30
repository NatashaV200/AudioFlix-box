import { useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import { contentData } from "@/data/content";
import { Sparkles, Music2 } from "lucide-react";

type MoodBadge = {
  mood: string;
  emoji: string;
  score: number;
};

const moodMap: Record<string, { mood: string; emoji: string }> = {
  "sci-fi": { mood: "Future Drift", emoji: "🚀" },
  nature: { mood: "Calm Nature", emoji: "🌿" },
  memoir: { mood: "Reflective", emoji: "🪞" },
  thriller: { mood: "Adrenaline", emoji: "⚡" },
  history: { mood: "Curious Mind", emoji: "📚" },
  tech: { mood: "Hyper Focus", emoji: "🧠" },
  documentary: { mood: "Deep Dive", emoji: "🎥" },
  fiction: { mood: "Story Escape", emoji: "✨" },
  adventure: { mood: "Explorer", emoji: "🧭" },
  "self-help": { mood: "Growth Mode", emoji: "📈" },
  strategy: { mood: "Game Plan", emoji: "♟️" },
  default: { mood: "Mixed Vibes", emoji: "🎶" },
};

const seededValue = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const Profile = () => {
  const user = {
    name: "Natalie",
    handle: "@natalie_audio",
    avatar: "🎧",
  };

  const dayKey = new Date().toISOString().slice(0, 10);

  const { collageItems, moodBadges } = useMemo(() => {
    const played = contentData
      .map((item) => {
        const seed = `${user.handle}-${item.id}-${dayKey}`;
        const playCount = (seededValue(seed) % 120) + 8;
        const weighted = playCount + (item.rating ? Math.round(item.rating * 10) : 0);
        return { ...item, playCount: weighted };
      })
      .sort((a, b) => b.playCount - a.playCount);

    const topItems = played.slice(0, 9);

    const moodScore = new Map<string, number>();
    topItems.forEach((item) => {
      const key = item.genre?.toLowerCase() ?? "default";
      moodScore.set(key, (moodScore.get(key) ?? 0) + item.playCount);
    });

    const badges: MoodBadge[] = [...moodScore.entries()]
      .map(([genre, score]) => {
        const mapped = moodMap[genre] ?? moodMap.default;
        return { mood: mapped.mood, emoji: mapped.emoji, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return { collageItems: topItems, moodBadges: badges };
  }, [dayKey, user.handle]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <main className="pt-20 pb-12 max-w-6xl mx-auto px-4 lg:px-8 md:pl-24">
        <header className="rounded-2xl border border-border/50 bg-card p-6 md:p-8 card-shine">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center text-3xl">
                {user.avatar}
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">{user.name}'s Sound Collage</h1>
                <p className="text-sm text-muted-foreground">{user.handle} • Taste updates daily based on top plays</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary/70 px-3 py-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-accent" />
              Daily mood refresh: {dayKey}
            </div>
          </div>
        </header>

        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">Most-Played Mosaic</h2>
            <span className="text-xs text-muted-foreground">Top 9 picks</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[120px] sm:auto-rows-[140px]">
            {collageItems.map((item, idx) => (
              <article
                key={item.id}
                className={`relative rounded-xl overflow-hidden border border-border/40 bg-muted ${
                  idx === 0 ? "col-span-2 row-span-2" : ""
                }`}
              >
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">{item.playCount} plays</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-border/50 bg-card p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Music2 className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-display font-bold text-foreground">Top 5 Audio Moods</h2>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {moodBadges.map((badge) => (
              <div
                key={badge.mood}
                className="rounded-xl border border-accent/30 bg-accent/10 px-3 py-2.5"
              >
                <p className="text-sm font-semibold text-foreground">
                  <span className="mr-1">{badge.emoji}</span>
                  {badge.mood}
                </p>
                <p className="text-[11px] text-muted-foreground">Mood score: {badge.score}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer className="md:pl-24" />
    </div>
  );
};

export default Profile;
