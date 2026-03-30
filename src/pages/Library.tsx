import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Grid2X2, List, Play, Download, Heart } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import { contentData, ContentItem } from "@/data/content";

type LibraryTab = "library" | "continue" | "downloads" | "wishlist";

interface LibraryProps {
  initialTab?: LibraryTab;
}

const tabs: Array<{ key: LibraryTab; label: string }> = [
  { key: "library", label: "Library" },
  { key: "continue", label: "Continue Listening" },
  { key: "downloads", label: "Downloads" },
  { key: "wishlist", label: "Wishlist" },
];

const seeded = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getProgress = (item: ContentItem) => {
  const stored = Number(localStorage.getItem(`audioflix-progress-${item.id}`) ?? "0");
  if (Number.isFinite(stored) && stored > 0) return Math.min(stored, 99);
  return (seeded(item.id) % 75) + 10;
};

const Library = ({ initialTab = "library" }: LibraryProps) => {
  const [activeTab, setActiveTab] = useState<LibraryTab>(initialTab);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const audiobooks = useMemo(() => contentData.filter((c) => c.type === "audio"), []);

  const continueListening = useMemo(
    () =>
      audiobooks
        .map((item) => ({ item, progress: getProgress(item) }))
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 12),
    [audiobooks],
  );

  const downloads = useMemo(() => audiobooks.slice(0, 10), [audiobooks]);
  const wishlist = useMemo(() => audiobooks.slice(8, 20), [audiobooks]);

  const currentItems = useMemo(() => {
    if (activeTab === "library") return audiobooks;
    if (activeTab === "downloads") return downloads;
    if (activeTab === "wishlist") return wishlist;
    return continueListening.map((c) => c.item);
  }, [activeTab, audiobooks, continueListening, downloads, wishlist]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />

      <main className="pt-20 pb-12 px-4 lg:px-8 md:pl-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Your Library</h1>
            <div className="flex items-center gap-2 rounded-xl bg-secondary/70 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`tap-target px-3 py-2 rounded-lg text-sm inline-flex items-center gap-1.5 ${
                  viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <Grid2X2 className="w-4 h-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`tap-target px-3 py-2 rounded-lg text-sm inline-flex items-center gap-1.5 ${
                  viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`tap-target rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "continue" ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
              {continueListening.map(({ item, progress }) => (
                <article
                  key={item.id}
                  className={`rounded-xl border border-border/50 bg-card p-3 ${
                    viewMode === "list" ? "flex items-center gap-3" : ""
                  }`}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className={viewMode === "list" ? "w-16 h-16 rounded-lg object-cover" : "w-full aspect-[16/9] rounded-lg object-cover"}
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0 mt-3">
                    <h3 className="text-sm font-semibold text-foreground truncate">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.author ?? "AudioFlix Narrator"}</p>

                    <div className="mt-3">
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{progress}% completed</p>
                    </div>

                    <Link
                      to={`/player/${item.id}`}
                      className="tap-target mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Resume
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                  : "space-y-3"
              }
            >
              {currentItems.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-xl border border-border/50 bg-card p-3 ${
                    viewMode === "list" ? "flex items-center gap-3" : ""
                  }`}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className={viewMode === "list" ? "w-16 h-16 rounded-lg object-cover" : "w-full aspect-[2/3] rounded-lg object-cover"}
                    loading="lazy"
                  />

                  <div className="mt-2 flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{item.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{item.author ?? "AudioFlix Narrator"}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <Link
                        to={`/book/${item.id}`}
                        className="tap-target inline-flex items-center justify-center rounded-md bg-secondary/70 px-2.5 py-1.5 text-xs text-foreground"
                      >
                        Details
                      </Link>

                      {activeTab === "downloads" && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-success font-medium">
                          <Download className="w-3 h-3" />
                          Saved
                        </span>
                      )}

                      {activeTab === "wishlist" && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-accent font-medium">
                          <Heart className="w-3 h-3 fill-current" />
                          Wishlisted
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer className="md:pl-24" />
    </div>
  );
};

export default Library;
