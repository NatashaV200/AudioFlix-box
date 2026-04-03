import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  BookmarkPlus,
  Check,
  Circle,
  ChevronUp,
  ChevronDown,
  Clock3,
  Play,
  Pause,
  PlayCircle,
  TimerReset,
} from "lucide-react";
import { ContentItem } from "@/data/content";
import { addListeningHighlight, getHighlightsByContent, ListeningHighlight } from "@/lib/highlightsStore";

interface CustomAudioPlayerProps {
  item: ContentItem;
  audioRef: RefObject<HTMLAudioElement>;
  isPlaying: boolean;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2] as const;
const SLEEP_OPTIONS = [0, 15, 30, 45, 60] as const;
const HIGHLIGHT_COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"] as const;

const formatTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const parseDurationToSeconds = (duration?: string) => {
  if (!duration) return 6 * 3600;
  const h = Number(duration.match(/(\d+)h/)?.[1] ?? 0);
  const m = Number(duration.match(/(\d+)m/)?.[1] ?? 0);
  const secs = h * 3600 + m * 60;
  return secs > 0 ? secs : 6 * 3600;
};

const chapterize = (item: ContentItem) => {
  const total = parseDurationToSeconds(item.duration);
  const chapterCount = 8;
  const base = Math.floor(total / chapterCount);

  let cursor = 0;
  return Array.from({ length: chapterCount }).map((_, i) => {
    const bump = ((i % 3) - 1) * 120;
    const len = Math.max(8 * 60, base + bump);
    const start = cursor;
    cursor += len;
    return {
      id: i + 1,
      title: i === 0 ? "Introduction" : `Chapter ${i + 1}`,
      start,
      duration: formatTime(len),
    };
  });
};

const CustomAudioPlayer = ({ item, audioRef, isPlaying }: CustomAudioPlayerProps) => {
  const [expanded, setExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [sleepMinutes, setSleepMinutes] = useState(0);
  const [highlights, setHighlights] = useState<ListeningHighlight[]>([]);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState("");
  const [bookmarkColor, setBookmarkColor] = useState<(typeof HIGHLIGHT_COLORS)[number]>(HIGHLIGHT_COLORS[0]);
  const [isSavingHighlight, setIsSavingHighlight] = useState(false);
  const sleepTimerRef = useRef<number | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const chapters = useMemo(() => chapterize(item), [item]);

  useEffect(() => {
    const savedSpeed = Number(localStorage.getItem("audioflix-playback-speed") ?? "1");
    if (SPEED_OPTIONS.includes(savedSpeed as (typeof SPEED_OPTIONS)[number])) {
      setSpeed(savedSpeed);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = speed;
    localStorage.setItem("audioflix-playback-speed", String(speed));
  }, [audioRef, speed]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    void getHighlightsByContent(item.id).then(setHighlights);

    const onLoaded = () => {
      const stored = Number(localStorage.getItem(`audioflix-position-seconds-${item.id}`) ?? "0");
      if (stored > 0 && Number.isFinite(stored)) {
        audio.currentTime = Math.min(stored, audio.duration || stored);
      }
      setDuration(audio.duration || parseDurationToSeconds(item.duration));
      setCurrentTime(audio.currentTime || 0);
    };

    const onTime = () => {
      const t = audio.currentTime || 0;
      const d = audio.duration || parseDurationToSeconds(item.duration);
      setCurrentTime(t);
      setDuration(d);
      localStorage.setItem(`audioflix-position-seconds-${item.id}`, String(Math.floor(t)));
      const progress = d > 0 ? Math.floor((t / d) * 100) : 0;
      localStorage.setItem(`audioflix-progress-${item.id}`, String(progress));
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    onLoaded();

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
    };
  }, [audioRef, item]);

  useEffect(() => {
    if (sleepTimerRef.current) {
      window.clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    if (sleepMinutes <= 0) return;

    sleepTimerRef.current = window.setTimeout(() => {
      audioRef.current?.pause();
      setSleepMinutes(0);
    }, sleepMinutes * 60 * 1000);

    return () => {
      if (sleepTimerRef.current) {
        window.clearTimeout(sleepTimerRef.current);
      }
    };
  }, [audioRef, sleepMinutes]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) await audio.play();
    else audio.pause();
  };

  const openBookmarkModal = () => {
    setBookmarkNote("");
    setBookmarkColor(HIGHLIGHT_COLORS[0]);
    setIsHighlightModalOpen(true);
  };

  const saveBookmarkHighlight = async () => {
    const timestamp = Math.max(0, Math.floor(currentTime));
    const trimmed = bookmarkNote.trim();
    if (!trimmed) return;

    setIsSavingHighlight(true);
    await addListeningHighlight({
      contentId: item.id,
      title: item.title,
      thumbnail: item.thumbnail,
      author: item.author,
      timestamp,
      note: trimmed,
      color: bookmarkColor,
      createdAt: Date.now(),
    });

    const refreshed = await getHighlightsByContent(item.id);
    setHighlights(refreshed);
    setIsSavingHighlight(false);
    setIsHighlightModalOpen(false);
  };

  const cycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(speed as (typeof SPEED_OPTIONS)[number]);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    setSpeed(next);
  };

  const cycleSleep = () => {
    const idx = SLEEP_OPTIONS.indexOf(sleepMinutes as (typeof SLEEP_OPTIONS)[number]);
    const next = SLEEP_OPTIONS[(idx + 1) % SLEEP_OPTIONS.length];
    setSleepMinutes(next);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts if not typing in an input/textarea
      const isTyping =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement;

      if (isTyping) return;

      switch (event.code) {
        case "Space": {
          event.preventDefault();
          togglePlay();
          break;
        }
        case "ArrowLeft": {
          event.preventDefault();
          const audio = audioRef.current;
          if (audio) {
            audio.currentTime = Math.max(0, audio.currentTime - 10);
          }
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          const audio = audioRef.current;
          if (audio) {
            audio.currentTime = Math.min(duration, audio.currentTime + 10);
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, duration, audioRef]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:left-20">
      {isHighlightModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm px-4 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-5 animate-fade-in">
            <h3 className="text-lg font-display font-bold text-foreground">Add bookmark note</h3>
            <p className="text-xs text-muted-foreground mt-1">Saved at {formatTime(currentTime)}</p>

            <label className="block text-xs text-muted-foreground mt-4">
              Note
              <textarea
                value={bookmarkNote}
                onChange={(e) => setBookmarkNote(e.target.value)}
                rows={3}
                maxLength={200}
                placeholder="What stood out here?"
                className="mt-1 w-full rounded-lg bg-secondary border border-border/60 px-3 py-2 text-sm text-foreground"
              />
            </label>

            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBookmarkColor(color)}
                    className="tap-target w-8 h-8 rounded-full border border-border/60 flex items-center justify-center"
                    style={{ backgroundColor: color }}
                    aria-label={`Select highlight color ${color}`}
                  >
                    {bookmarkColor === color ? <Check className="w-4 h-4 text-white" /> : <Circle className="w-3 h-3 text-white/70" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setIsHighlightModalOpen(false)}
                className="tap-target rounded-lg bg-secondary px-3 py-2 text-sm text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={saveBookmarkHighlight}
                disabled={isSavingHighlight || !bookmarkNote.trim()}
                className="tap-target rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {isSavingHighlight ? "Saving..." : "Save highlight"}
              </button>
            </div>
          </div>
        </div>
      )}

      {expanded && (
        <div className="border-t border-border/60 bg-card/95 backdrop-blur-xl p-4 md:p-5 max-h-[55vh] overflow-y-auto">
          <div className="max-w-5xl mx-auto grid md:grid-cols-[180px_1fr] gap-5">
            <div className="rounded-xl overflow-hidden border border-border/40 bg-muted h-[180px] w-[180px]">
              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <button
                  onClick={openBookmarkModal}
                  className="tap-target inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-foreground hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label="Add bookmark at current position"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  Add bookmark
                </button>
                <button
                  onClick={cycleSleep}
                  className="tap-target inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-foreground hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`Sleep timer: ${sleepMinutes > 0 ? `${sleepMinutes} minutes` : "Off"}`}
                >
                  <TimerReset className="w-4 h-4" />
                  Sleep: {sleepMinutes > 0 ? `${sleepMinutes}m` : "Off"}
                </button>
              </div>

              {highlights.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Highlights</p>
                  <div className="space-y-2">
                    {highlights.map((highlight) => (
                      <button
                        key={`${highlight.id ?? `${highlight.timestamp}-${highlight.createdAt}`}`}
                        onClick={() => {
                          if (audioRef.current) {
                            audioRef.current.currentTime = highlight.timestamp;
                            void audioRef.current.play();
                          }
                        }}
                        className="w-full tap-target rounded-lg bg-secondary/55 px-3 py-2 text-left hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                        aria-label={`Jump to highlight at ${formatTime(highlight.timestamp)}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm text-foreground truncate">{highlight.note}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{formatTime(highlight.timestamp)}</p>
                          </div>
                          <span className="w-3 h-3 rounded-full border border-white/40" style={{ backgroundColor: highlight.color }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Chapters</p>
                <div className="space-y-2">
                  {chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = chapter.start;
                          void audioRef.current.play();
                        }
                      }}
                      className="w-full tap-target rounded-lg bg-secondary/50 hover:bg-secondary px-3 py-2 text-left flex items-center justify-between text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      aria-label={`Play ${chapter.title} (${chapter.duration})`}
                    >
                      <span className="inline-flex items-center gap-2 text-foreground">
                        <PlayCircle className="w-4 h-4" />
                        {chapter.title}
                      </span>
                      <span className="text-xs text-muted-foreground">{chapter.duration}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl px-3 py-2.5 md:px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="tap-target w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={isPlaying ? "Pause (Space)" : "Play (Space)"}
              title="Space bar to toggle play/pause"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(duration, 1)}
                step={1}
                value={currentTime}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setCurrentTime(next);
                  if (audioRef.current) audioRef.current.currentTime = next;
                }}
                className="w-full accent-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                aria-label="Seek timeline"
                title="Use arrow keys to skip 10 seconds"
              />
            </div>

            <button
              onClick={cycleSpeed}
              className="tap-target rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`Playback speed: ${speed}x`}
              title="Click to cycle through speed options (0.75x, 1x, 1.25x, 1.5x, 2x)"
            >
              {speed}x
            </button>

            <button
              onClick={cycleSleep}
              className="tap-target rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 hidden sm:inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`Sleep timer: ${sleepMinutes > 0 ? `${sleepMinutes} minutes` : "Off"}`}
              title="Click to cycle through sleep timer options (Off, 15m, 30m, 45m, 60m)"
            >
              <Clock3 className="w-4 h-4" />
              {sleepMinutes > 0 ? `${sleepMinutes}m` : "Sleep"}
            </button>

            <button
              onClick={() => setExpanded((v) => !v)}
              className="tap-target w-11 h-11 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={expanded ? "Collapse player" : "Expand player"}
              aria-expanded={expanded}
            >
              {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAudioPlayer;
