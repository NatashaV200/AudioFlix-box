import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, CheckCircle2, WifiOff } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import { contentData } from "@/data/content";

const STORAGE_KEY = "audioflix-downloaded-ids";

const getDefaultDownloadedIds = () =>
  contentData
    .filter((item) => item.type === "audio")
    .slice(0, 10)
    .map((item) => item.id);

const getDownloadedIds = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const defaults = getDefaultDownloadedIds();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }
  try {
    const parsed = JSON.parse(stored) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const Downloads = () => {
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [offlineToastVisible, setOfflineToastVisible] = useState(false);

  useEffect(() => {
    setDownloadedIds(getDownloadedIds());
  }, []);

  useEffect(() => {
    const handleOffline = () => {
      setOfflineToastVisible(true);
      window.setTimeout(() => setOfflineToastVisible(false), 2500);
    };

    if (!navigator.onLine) {
      handleOffline();
    }

    window.addEventListener("offline", handleOffline);
    return () => window.removeEventListener("offline", handleOffline);
  }, []);

  const downloadedBooks = useMemo(
    () =>
      contentData.filter((item) => item.type === "audio" && downloadedIds.includes(item.id)),
    [downloadedIds],
  );

  const removeDownload = (id: string) => {
    const updated = downloadedIds.filter((bookId) => bookId !== id);
    setDownloadedIds(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("audioflix-downloads-updated"));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />

      <main className="pt-20 pb-12 px-4 lg:px-8 md:pl-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">Downloads</h1>

          {downloadedBooks.length === 0 ? (
            <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
              <p className="text-muted-foreground">No downloaded audiobooks yet.</p>
              <Link
                to="/search"
                className="tap-target mt-4 inline-flex items-center rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold"
              >
                Find audiobooks
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {downloadedBooks.map((book) => (
                <article key={book.id} className="rounded-xl border border-border/50 bg-card p-3">
                  <div className="relative">
                    <img
                      src={book.thumbnail}
                      alt={book.title}
                      className="w-full aspect-[2/3] rounded-lg object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-success/20 text-success px-2 py-1 text-[11px] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Downloaded
                    </span>
                  </div>

                  <div className="mt-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{book.author ?? "AudioFlix Narrator"}</p>
                    </div>

                    <button
                      onClick={() => removeDownload(book.id)}
                      className="tap-target w-9 h-9 rounded-lg bg-secondary text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      aria-label={`Delete ${book.title} download`}
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {offlineToastVisible && (
        <div className="fixed bottom-24 right-4 z-[80] rounded-xl border border-border/60 bg-card px-4 py-3 shadow-xl animate-fade-in inline-flex items-center gap-2 text-sm text-foreground">
          <WifiOff className="w-4 h-4 text-accent" />
          Offline mode detected. Playing downloaded books only.
        </div>
      )}

      <Footer className="md:pl-24" />
    </div>
  );
};

export default Downloads;
