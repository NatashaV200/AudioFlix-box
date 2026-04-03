import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import FeaturedAudiobookCarousel from "@/components/content/FeaturedAudiobookCarousel";
import AudiobookRow from "@/components/content/AudiobookRow";
import ContentCard from "@/components/content/ContentCard";
import { contentData } from "@/data/content";

const GENRE_PREFS_KEY = "audioflix-genre-preferences";

const parseDurationMinutes = (duration?: string) => {
  if (!duration) return 360;
  const h = Number(duration.match(/(\d+)h/)?.[1] ?? 0);
  const m = Number(duration.match(/(\d+)m/)?.[1] ?? 0);
  const total = h * 60 + m;
  return total > 0 ? total : 360;
};

const Home = () => {
  const [search, setSearch] = useState("");
  const [genrePreferences, setGenrePreferences] = useState<Record<string, number>>({});

  const audiobooks = useMemo(() => contentData.filter((c) => c.type === "audio"), []);
  const featuredAudiobooks = [...audiobooks]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 5);
  const trendingAudiobooks = audiobooks
    .filter((c) => c.category === "trending" || c.category === "audiobooks")
    .slice(0, 12);
  const topRatedAudiobooks = [...audiobooks]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 12);
  const newAudiobooks = audiobooks
    .filter((c) => c.category === "new-releases" || c.category === "audiobooks")
    .slice(0, 12);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(GENRE_PREFS_KEY) ?? "{}") as Record<string, number>;
      const sanitized = Object.entries(stored).reduce<Record<string, number>>((acc, [genre, score]) => {
        if (genre && Number.isFinite(score) && score > 0) {
          acc[genre] = Number(score);
        }
        return acc;
      }, {});

      if (Object.keys(sanitized).length > 0) {
        setGenrePreferences(sanitized);
        return;
      }

      const derived = audiobooks.reduce<Record<string, number>>((acc, item) => {
        if (!item.genre) return acc;
        const progress = Number(localStorage.getItem(`audioflix-progress-${item.id}`) ?? "0");
        if (!Number.isFinite(progress) || progress <= 0) return acc;
        acc[item.genre] = (acc[item.genre] ?? 0) + progress;
        return acc;
      }, {});

      if (Object.keys(derived).length > 0) {
        localStorage.setItem(GENRE_PREFS_KEY, JSON.stringify(derived));
        setGenrePreferences(derived);
      }
    } catch {
      setGenrePreferences({});
    }
  }, [audiobooks]);

  const continueYourSeries = useMemo(() => {
    const inProgress = audiobooks
      .map((item) => {
        const progress = Number(localStorage.getItem(`audioflix-progress-${item.id}`) ?? "0");
        const lastPlayed = Number(localStorage.getItem(`audioflix-last-played-${item.id}`) ?? "0");
        return { item, progress, lastPlayed };
      })
      .filter((entry) => Number.isFinite(entry.progress) && entry.progress > 0 && entry.progress < 100)
      .sort((a, b) => {
        if (b.lastPlayed !== a.lastPlayed) return b.lastPlayed - a.lastPlayed;
        return b.progress - a.progress;
      })
      .slice(0, 12)
      .map((entry) => entry.item);

    if (inProgress.length > 0) return inProgress;

    return [...audiobooks]
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 12);
  }, [audiobooks]);

  const popularInYourGenres = useMemo(() => {
    const favoriteGenres = Object.entries(genrePreferences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    const pool = favoriteGenres.length > 0
      ? audiobooks.filter((item) => item.genre && favoriteGenres.includes(item.genre))
      : [...audiobooks];

    return pool
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 12);
  }, [audiobooks, genrePreferences]);

  const shortListensForToday = useMemo(() => {
    return [...audiobooks]
      .filter((item) => parseDurationMinutes(item.duration) <= 420)
      .sort((a, b) => {
        const durationA = parseDurationMinutes(a.duration);
        const durationB = parseDurationMinutes(b.duration);
        if (durationA !== durationB) return durationA - durationB;
        return (b.rating ?? 0) - (a.rating ?? 0);
      })
      .slice(0, 12);
  }, [audiobooks]);

  const filtered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return contentData.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.genre?.toLowerCase().includes(q) ||
        c.type.includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearchChange={setSearch} showSearch searchValue={search} />
      <Sidebar />

      {filtered ? (
        <div className="pt-20 pb-12 max-w-[1440px] mx-auto px-4 lg:px-8 md:pl-24">
          <h2 className="text-2xl font-display font-bold text-foreground mb-6">
            Results for &ldquo;{search}&rdquo;
          </h2>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground">No content found.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
              {filtered.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="md:pl-24">
          <FeaturedAudiobookCarousel items={featuredAudiobooks} />
          <div className="-mt-6 relative z-10 pb-8">
            <AudiobookRow title="🔥 Trending Audiobooks" items={trendingAudiobooks} />
            <AudiobookRow title="⭐ Top Rated" items={topRatedAudiobooks} />
            <AudiobookRow title="🆕 New Releases" items={newAudiobooks} />

            <section className="mt-12">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground px-4 lg:px-8">
                Smart Playlists
              </h2>
              <AudiobookRow title="📚 Continue Your Series" items={continueYourSeries} />
              <AudiobookRow title="🎯 Popular in Your Genres" items={popularInYourGenres} />
              <AudiobookRow title="⏱️ Short listens for today" items={shortListensForToday} />
            </section>
          </div>
        </div>
      )}

      <Footer className="md:pl-24" />
    </div>
  );
};

export default Home;
