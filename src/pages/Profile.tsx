import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import { contentData } from "@/data/content";
import { Crown, Headphones, Clock3, Save, Sparkles } from "lucide-react";

const seededValue = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const parseHours = (duration?: string) => {
  if (!duration) return 4;
  const h = Number(duration.match(/(\d+)h/)?.[1] ?? 0);
  const m = Number(duration.match(/(\d+)m/)?.[1] ?? 0);
  const hours = h + m / 60;
  return hours > 0 ? hours : 4;
};

const speedOptions = [0.75, 1, 1.25, 1.5, 2] as const;
const skipOptions = [10, 15, 30, 45] as const;

const Profile = () => {
  const user = {
    name: "Natalie",
    handle: "@natalie_audio",
    avatar: "🎧",
    membership: "Premium Member",
    joined: "Jan 2025",
  };

  const [defaultSpeed, setDefaultSpeed] = useState<number>(1);
  const [skipInterval, setSkipInterval] = useState<number>(15);
  const [autoPlayNext, setAutoPlayNext] = useState(true);

  useEffect(() => {
    const storedSpeed = Number(localStorage.getItem("audioflix-playback-speed") ?? "1");
    const storedSkip = Number(localStorage.getItem("audioflix-skip-interval") ?? "15");
    const storedAutoplay = localStorage.getItem("audioflix-autoplay-next");

    if (speedOptions.includes(storedSpeed as (typeof speedOptions)[number])) {
      setDefaultSpeed(storedSpeed);
    }
    if (skipOptions.includes(storedSkip as (typeof skipOptions)[number])) {
      setSkipInterval(storedSkip);
    }
    if (storedAutoplay !== null) {
      setAutoPlayNext(storedAutoplay === "true");
    }
  }, []);

  const savePlaybackSettings = () => {
    localStorage.setItem("audioflix-playback-speed", String(defaultSpeed));
    localStorage.setItem("audioflix-skip-interval", String(skipInterval));
    localStorage.setItem("audioflix-autoplay-next", String(autoPlayNext));
    alert("Playback preferences saved.");
  };

  const { totalHours, topGenres, completedTitles, hoursGoalProgress } = useMemo(() => {
    const listened = contentData
      .filter((item) => item.type === "audio")
      .map((item) => {
        const seed = `${user.handle}-${item.id}`;
        const plays = (seededValue(seed) % 8) + 2;
        const progress = (seededValue(`${seed}-progress`) % 80) + 20;
        const listenedHours = parseHours(item.duration) * (progress / 100) * plays;
        return { ...item, plays, progress, listenedHours };
      });

    const total = listened.reduce((acc, item) => acc + item.listenedHours, 0);

    const genreHours = new Map<string, number>();
    listened.forEach((item) => {
      const genre = item.genre ?? "Other";
      genreHours.set(genre, (genreHours.get(genre) ?? 0) + item.listenedHours);
    });

    const rankedGenres = [...genreHours.entries()]
      .map(([genre, hours]) => ({
        genre,
        hours,
        share: total > 0 ? Math.round((hours / total) * 100) : 0,
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);

    const doneCount = listened.filter((item) => item.progress >= 85).length;
    const goalHours = 300;

    return {
      totalHours: Math.round(total),
      topGenres: rankedGenres,
      completedTitles: doneCount,
      hoursGoalProgress: Math.min(100, Math.round((total / goalHours) * 100)),
    };
  }, [user.handle]);

  const circularProgress = {
    radius: 54,
    circumference: 2 * Math.PI * 54,
  };
  const offset = circularProgress.circumference - (hoursGoalProgress / 100) * circularProgress.circumference;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <main className="pt-20 pb-12 max-w-6xl mx-auto px-4 lg:px-8 md:pl-24">
        <header className="rounded-2xl border border-border/50 bg-card p-6 md:p-8 card-shine">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center text-3xl border border-border/60">
                {user.avatar}
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">{user.name}</h1>
                <p className="text-sm text-muted-foreground">{user.handle}</p>
                <p className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-gold/10 text-gold px-2.5 py-1 text-xs font-semibold border border-gold/30">
                  <Crown className="w-3.5 h-3.5" />
                  {user.membership}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary/70 px-3 py-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-accent" />
              Joined {user.joined}
            </div>
          </div>
        </header>

        <section className="mt-8 grid lg:grid-cols-[280px_1fr] gap-5">
          <div className="rounded-2xl border border-border/50 bg-card p-5 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 140 140" aria-label="Listening goal progress">
                <circle cx="70" cy="70" r={circularProgress.radius} stroke="hsl(var(--secondary))" strokeWidth="10" fill="none" />
                <circle
                  cx="70"
                  cy="70"
                  r={circularProgress.radius}
                  stroke="hsl(var(--primary))"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={circularProgress.circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-foreground">{hoursGoalProgress}%</p>
                <p className="text-[11px] text-muted-foreground">year goal</p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm font-semibold text-foreground inline-flex items-center gap-1.5">
                <Clock3 className="w-4 h-4 text-accent" />
                {totalHours} total hours
              </p>
              <p className="text-xs text-muted-foreground mt-1">{completedTitles} titles nearly completed</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-5 md:p-6">
            <h2 className="text-xl font-display font-bold text-foreground mb-4 inline-flex items-center gap-2">
              <Headphones className="w-5 h-5 text-accent" />
              Top genres
            </h2>

            <div className="space-y-3">
              {topGenres.map((entry) => (
                <div key={entry.genre}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground font-medium">{entry.genre}</span>
                    <span className="text-muted-foreground">{entry.share}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${entry.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-border/50 bg-card p-5 md:p-6">
          <h2 className="text-xl font-display font-bold text-foreground mb-4">Playback preferences</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <label className="text-xs text-muted-foreground">
              Default speed
              <select
                value={defaultSpeed}
                onChange={(e) => setDefaultSpeed(Number(e.target.value))}
                className="mt-1 w-full rounded-lg bg-secondary border border-border/60 px-3 py-2 text-sm text-foreground"
              >
                {speedOptions.map((speed) => (
                  <option key={speed} value={speed}>
                    {speed}x
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-muted-foreground">
              Skip interval
              <select
                value={skipInterval}
                onChange={(e) => setSkipInterval(Number(e.target.value))}
                className="mt-1 w-full rounded-lg bg-secondary border border-border/60 px-3 py-2 text-sm text-foreground"
              >
                {skipOptions.map((skip) => (
                  <option key={skip} value={skip}>
                    {skip} seconds
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center justify-between gap-3 rounded-lg bg-secondary/60 border border-border/60 px-3 py-2 mt-4 md:mt-[1.15rem]">
              <span className="text-sm text-foreground">Autoplay next chapter</span>
              <button
                onClick={() => setAutoPlayNext((v) => !v)}
                type="button"
                className={`tap-target w-12 h-7 rounded-full p-1 transition-colors ${
                  autoPlayNext ? "bg-primary" : "bg-muted"
                }`}
                aria-label="Toggle autoplay next"
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white transition-transform ${
                    autoPlayNext ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </label>
          </div>

          <button
            onClick={savePlaybackSettings}
            className="tap-target mt-5 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 font-semibold hover:bg-primary/90"
          >
            <Save className="w-4 h-4" />
            Save preferences
          </button>
        </section>
      </main>
      <Footer className="md:pl-24" />
    </div>
  );
};

export default Profile;
