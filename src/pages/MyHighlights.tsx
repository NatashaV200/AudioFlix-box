import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Highlighter } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import { getAllHighlights, ListeningHighlight } from "@/lib/highlightsStore";

const formatTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const MyHighlights = () => {
  const [highlights, setHighlights] = useState<ListeningHighlight[]>([]);

  useEffect(() => {
    void getAllHighlights().then(setHighlights);
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, { meta: ListeningHighlight; entries: ListeningHighlight[] }>();

    highlights.forEach((entry) => {
      const existing = map.get(entry.contentId);
      if (!existing) {
        map.set(entry.contentId, { meta: entry, entries: [entry] });
        return;
      }
      existing.entries.push(entry);
      if (entry.createdAt > existing.meta.createdAt) {
        existing.meta = entry;
      }
    });

    return [...map.entries()]
      .map(([contentId, group]) => ({
        contentId,
        meta: group.meta,
        entries: group.entries.sort((a, b) => a.timestamp - b.timestamp),
      }))
      .sort((a, b) => b.meta.createdAt - a.meta.createdAt);
  }, [highlights]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />

      <main className="pt-20 pb-12 px-4 lg:px-8 md:pl-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6 inline-flex items-center gap-2">
            <Highlighter className="w-7 h-7 text-accent" />
            My Highlights
          </h1>

          {grouped.length === 0 ? (
            <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
              <p className="text-muted-foreground">No highlights yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Add bookmark notes from the audio player to build your highlight library.</p>
              <Link
                to="/browse"
                className="tap-target mt-4 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold"
              >
                Browse audiobooks
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {grouped.map(({ contentId, meta, entries }) => (
                <section key={contentId} className="rounded-2xl border border-border/50 bg-card p-4 md:p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <img src={meta.thumbnail} alt={meta.title} className="w-14 h-14 rounded-lg object-cover" loading="lazy" />
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-foreground truncate">{meta.title}</h2>
                      <p className="text-xs text-muted-foreground truncate">{meta.author ?? "AudioFlix Narrator"}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{entries.length} highlight{entries.length > 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {entries.map((entry) => (
                      <Link
                        key={`${entry.id ?? `${entry.timestamp}-${entry.createdAt}`}`}
                        to={`/player/${contentId}?t=${entry.timestamp}&autoplay=1`}
                        className="block rounded-xl border border-border/40 bg-secondary/40 hover:bg-secondary/70 transition-colors p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm text-foreground truncate">{entry.note}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{formatTime(entry.timestamp)}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="w-3 h-3 rounded-full border border-white/40" style={{ backgroundColor: entry.color }} />
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                              <Play className="w-3.5 h-3.5 fill-current" />
                              Play
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer className="md:pl-24" />
    </div>
  );
};

export default MyHighlights;
