import { useEffect, useMemo, useRef, useState } from "react";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import AudiobookCard from "@/components/content/AudiobookCard";
import { contentData, ContentItem } from "@/data/content";

type EnrichedItem = ContentItem & {
  narrator: string;
  language: string;
  durationMinutes: number;
};

const parseDurationMinutes = (duration?: string) => {
  if (!duration) return 300;
  const h = Number(duration.match(/(\d+)h/)?.[1] ?? 0);
  const m = Number(duration.match(/(\d+)m/)?.[1] ?? 0);
  const total = h * 60 + m;
  return total > 0 ? total : 300;
};

const seededValue = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const narrators = [
  "Amelia Hart",
  "David Moore",
  "Sophia Reed",
  "Marcus Flynn",
  "Luna Patel",
  "Noah Bennett",
];

const languages = ["English", "Spanish", "French", "German", "Hindi"];

const Search = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [genre, setGenre] = useState("all");
  const [narrator, setNarrator] = useState("all");
  const [language, setLanguage] = useState("all");
  const [rating, setRating] = useState(0);
  const [minDuration, setMinDuration] = useState(0);
  const [maxDuration, setMaxDuration] = useState(1800);

  const [visibleCount, setVisibleCount] = useState(18);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const audiobooks = useMemo<EnrichedItem[]>(() => {
    return contentData
      .filter((item) => item.type === "audio")
      .map((item) => {
        const seed = seededValue(item.id + item.title);
        const narratorName = item.author ?? narrators[seed % narrators.length];
        const languageName = languages[seed % languages.length];

        return {
          ...item,
          narrator: narratorName,
          language: languageName,
          durationMinutes: parseDurationMinutes(item.duration),
        };
      });
  }, []);

  const genres = useMemo(
    () => ["all", ...Array.from(new Set(audiobooks.map((a) => a.genre).filter(Boolean) as string[])).sort()],
    [audiobooks],
  );

  const narratorOptions = useMemo(
    () => ["all", ...Array.from(new Set(audiobooks.map((a) => a.narrator))).sort()],
    [audiobooks],
  );

  const languageOptions = useMemo(
    () => ["all", ...Array.from(new Set(audiobooks.map((a) => a.language))).sort()],
    [audiobooks],
  );

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const s = new Set<string>();
    audiobooks.forEach((item) => {
      if (item.title.toLowerCase().includes(q)) s.add(item.title);
      if (item.genre?.toLowerCase().includes(q)) s.add(item.genre);
    });

    return Array.from(s).slice(0, 8);
  }, [audiobooks, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return audiobooks.filter((item) => {
      const matchesQuery =
        q.length === 0 ||
        item.title.toLowerCase().includes(q) ||
        item.genre?.toLowerCase().includes(q);

      const matchesGenre = genre === "all" || item.genre === genre;
      const matchesNarrator = narrator === "all" || item.narrator === narrator;
      const matchesLanguage = language === "all" || item.language === language;
      const matchesRating = (item.rating ?? 0) >= rating;
      const matchesDuration = item.durationMinutes >= minDuration && item.durationMinutes <= maxDuration;

      return (
        matchesQuery &&
        matchesGenre &&
        matchesNarrator &&
        matchesLanguage &&
        matchesRating &&
        matchesDuration
      );
    });
  }, [audiobooks, query, genre, narrator, language, rating, minDuration, maxDuration]);

  useEffect(() => {
    const q = searchParams.get("query")?.trim() ?? "";
    setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    setVisibleCount(18);
  }, [query, genre, narrator, language, rating, minDuration, maxDuration]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 12, filtered.length));
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [filtered.length]);

  const visibleItems = filtered.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />

      <main className="pt-20 pb-12 px-4 lg:px-8 md:pl-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
            <div className="relative flex-1">
              <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5">
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                  placeholder="Search by title or genre..."
                  className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="tap-target w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4 mx-auto" />
                  </button>
                )}
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 rounded-xl border border-border bg-card shadow-xl z-30 overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setQuery(s);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-secondary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowFilters((v) => !v)}
              className="tap-target inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-foreground"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <section className="rounded-2xl border border-border/50 bg-card p-4 md:p-5 mb-6 animate-fade-in">
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <label className="text-xs text-muted-foreground">
                  Genre
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-secondary border border-border/60 px-3 py-2 text-sm text-foreground"
                  >
                    {genres.map((g) => (
                      <option key={g} value={g}>
                        {g === "all" ? "All genres" : g}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs text-muted-foreground">
                  Narrator
                  <select
                    value={narrator}
                    onChange={(e) => setNarrator(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-secondary border border-border/60 px-3 py-2 text-sm text-foreground"
                  >
                    {narratorOptions.map((n) => (
                      <option key={n} value={n}>
                        {n === "all" ? "All narrators" : n}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs text-muted-foreground">
                  Language
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-secondary border border-border/60 px-3 py-2 text-sm text-foreground"
                  >
                    {languageOptions.map((l) => (
                      <option key={l} value={l}>
                        {l === "all" ? "All languages" : l}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs text-muted-foreground">
                  Minimum Rating ({rating.toFixed(1)}★)
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={0.1}
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                </label>

                <div className="text-xs text-muted-foreground">
                  Duration Range
                  <div className="mt-1 rounded-lg bg-secondary border border-border/60 px-3 py-2 text-sm text-foreground space-y-2">
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">Min: {minDuration} min</p>
                      <input
                        type="range"
                        min={0}
                        max={1800}
                        step={15}
                        value={minDuration}
                        onChange={(e) => setMinDuration(Math.min(Number(e.target.value), maxDuration))}
                        className="w-full accent-primary"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">Max: {maxDuration} min</p>
                      <input
                        type="range"
                        min={0}
                        max={1800}
                        step={15}
                        value={maxDuration}
                        onChange={(e) => setMaxDuration(Math.max(Number(e.target.value), minDuration))}
                        className="w-full accent-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Search Results</h1>
            <p className="text-xs text-muted-foreground">{filtered.length} matches</p>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border/50 bg-card p-8 text-center text-muted-foreground">
              No books match your current filters.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {visibleItems.map((item) => (
                  <AudiobookCard key={item.id} item={item} />
                ))}
              </div>
              <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
            </>
          )}
        </div>
      </main>

      <Footer className="md:pl-24" />
    </div>
  );
};

export default Search;
