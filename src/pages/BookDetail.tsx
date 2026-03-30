import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Clock3,
  Star,
  Calendar,
  Tag,
  PlayCircle,
  UserRound,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import AudiobookRow from "@/components/content/AudiobookRow";
import { contentData } from "@/data/content";

type TabKey = "synopsis" | "reviews" | "author";

const parseDurationToMinutes = (text?: string) => {
  if (!text) return 320;
  const hMatch = text.match(/(\d+)h/);
  const mMatch = text.match(/(\d+)m/);
  const hours = hMatch ? Number(hMatch[1]) : 0;
  const mins = mMatch ? Number(mMatch[1]) : 0;
  const total = hours * 60 + mins;
  return total > 0 ? total : 320;
};

const formatMins = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

const generateChapters = (title: string, totalMins: number) => {
  const count = 8;
  const base = Math.floor(totalMins / count);
  const chapters = Array.from({ length: count }).map((_, i) => {
    const variation = ((i % 3) - 1) * 6;
    return Math.max(18, base + variation);
  });

  const sum = chapters.reduce((a, b) => a + b, 0);
  chapters[count - 1] = Math.max(18, chapters[count - 1] + (totalMins - sum));

  return chapters.map((mins, i) => ({
    id: i + 1,
    title: i === 0 ? `Intro to ${title}` : `Chapter ${i + 1}`,
    duration: formatMins(mins),
  }));
};

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("synopsis");
  const [activeChapter, setActiveChapter] = useState<number | null>(null);

  const book = contentData.find((c) => c.id === id && c.type === "audio");

  const resumeProgress = useMemo(() => {
    if (!id) return 0;
    const stored = Number(localStorage.getItem(`audioflix-progress-${id}`) ?? "0");
    return Number.isFinite(stored) ? Math.max(0, Math.min(stored, 95)) : 0;
  }, [id]);

  const chapters = useMemo(() => {
    if (!book) return [];
    return generateChapters(book.title, parseDurationToMinutes(book.duration));
  }, [book]);

  const moreLikeThis = useMemo(() => {
    if (!book) return [];
    return contentData
      .filter((item) => item.type === "audio" && item.id !== book.id)
      .sort((a, b) => {
        const sameGenreA = a.genre === book.genre ? 1 : 0;
        const sameGenreB = b.genre === book.genre ? 1 : 0;
        if (sameGenreA !== sameGenreB) return sameGenreB - sameGenreA;
        return (b.rating ?? 0) - (a.rating ?? 0);
      })
      .slice(0, 12);
  }, [book]);

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Sidebar />
        <main className="pt-24 pb-16 px-4 md:pl-24">
          <div className="max-w-4xl mx-auto rounded-2xl border border-border/50 bg-card p-8 text-center">
            <h1 className="text-3xl font-display font-bold text-foreground">Book not found</h1>
            <p className="mt-2 text-muted-foreground">This audiobook may have been removed.</p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back Home
            </Link>
          </div>
        </main>
        <Footer className="md:pl-24" />
      </div>
    );
  }

  const author = book.author ?? "AudioFlix Narrator";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />

      <main className="pt-20 pb-12 px-4 lg:px-8 md:pl-24">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <section className="grid lg:grid-cols-[280px_1fr] gap-6 md:gap-8">
            <div className="rounded-2xl overflow-hidden border border-border/40 bg-muted w-full max-w-[320px]">
              <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover" loading="eager" />
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">{book.title}</h1>
              <p className="mt-2 text-sm md:text-base text-muted-foreground">by {author}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {book.rating && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-gold/10 text-gold px-3 py-1.5 text-sm font-semibold">
                    <Star className="w-4 h-4 fill-current" />
                    {book.rating}
                  </span>
                )}
                {book.year && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {book.year}
                  </span>
                )}
                {book.duration && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-sm text-muted-foreground">
                    <Clock3 className="w-4 h-4" />
                    {book.duration}
                  </span>
                )}
                {book.genre && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-sm text-muted-foreground">
                    <Tag className="w-4 h-4" />
                    {book.genre}
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate(`/player/${book.id}`)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 font-semibold hover:bg-primary/90 transition-colors glow-primary"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {resumeProgress > 0 ? `Resume (${resumeProgress}%)` : "Play"}
                </button>
                {resumeProgress > 0 && (
                  <span className="text-xs text-muted-foreground">Last position saved automatically</span>
                )}
              </div>

              <div className="mt-8 rounded-2xl border border-border/50 bg-card p-4 md:p-5">
                <h2 className="text-lg font-display font-bold text-foreground mb-3">Chapters</h2>
                <div className="space-y-2">
                  {chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => {
                        setActiveChapter(chapter.id);
                        navigate(`/player/${book.id}`);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors text-left ${
                        activeChapter === chapter.id
                          ? "bg-primary/20 text-foreground"
                          : "bg-secondary/45 text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <PlayCircle className="w-4 h-4" />
                        <span className="font-medium text-sm">{chapter.title}</span>
                      </span>
                      <span className="text-xs">{chapter.duration}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex flex-wrap gap-2 border-b border-border/50 pb-3 mb-4">
              {([
                ["synopsis", "Synopsis"],
                ["reviews", "Reviews"],
                ["author", "Author Info"],
              ] as Array<[TabKey, string]>).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "synopsis" && (
              <p className="text-sm leading-7 text-muted-foreground">
                {book.title} is a gripping {book.genre?.toLowerCase() ?? "audiobook"} experience that blends strong
                storytelling with immersive narration. Follow a richly layered journey with memorable characters,
                meaningful ideas, and cinematic pacing designed for long-form listening sessions.
              </p>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-3">
                <div className="rounded-xl bg-secondary/50 p-3">
                  <p className="text-sm text-foreground font-medium">“Narration quality is top-tier and pacing is perfect.”</p>
                  <p className="text-xs text-muted-foreground mt-1">— Priya M. • 5.0 ★</p>
                </div>
                <div className="rounded-xl bg-secondary/50 p-3">
                  <p className="text-sm text-foreground font-medium">“Couldn’t stop listening. Great chapter structure.”</p>
                  <p className="text-xs text-muted-foreground mt-1">— David R. • 4.8 ★</p>
                </div>
              </div>
            )}

            {activeTab === "author" && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                  <UserRound className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{author}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {author} is known for compelling long-form storytelling and vivid narrative delivery. Their work
                    focuses on emotional pacing, character depth, and high-retention listening arcs.
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="mt-10">
            <AudiobookRow title="More like this" items={moreLikeThis} />
          </section>
        </div>
      </main>

      <Footer className="md:pl-24" />
    </div>
  );
};

export default BookDetail;
