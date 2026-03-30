import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  BookmarkPlus,
  ChevronUp,
  ChevronDown,
  Clock3,
  Play,
  Pause,
  PlayCircle,
  TimerReset,
} from "lucide-react";
import { ContentItem } from "@/data/content";

interface CustomAudioPlayerProps {
  item: ContentItem;
  audioRef: RefObject<HTMLAudioElement>;
  isPlaying: boolean;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2] as const;
const SLEEP_OPTIONS = [0, 15, 30, 45, 60] as const;

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
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const sleepTimerRef = useRef<number | null>(null);

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

    const bookmarkKey = `audioflix-bookmarks-${item.id}`;
    const savedBookmarks = JSON.parse(localStorage.getItem(bookmarkKey) ?? "[]") as number[];
    setBookmarks(savedBookmarks);

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

  const addBookmark = () => {
    const mark = Math.floor(currentTime);
    const unique = Array.from(new Set([...bookmarks, mark])).sort((a, b) => a - b);
    setBookmarks(unique);
    localStorage.setItem(`audioflix-bookmarks-${item.id}`, JSON.stringify(unique));
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:left-20">
      {expanded && (
        <div className="border-t border-border/60 bg-card/95 backdrop-blur-xl p-4 md:p-5 max-h-[55vh] overflow-y-auto">
          <div className="max-w-5xl mx-auto grid md:grid-cols-[180px_1fr] gap-5">
            <div className="rounded-xl overflow-hidden border border-border/40 bg-muted h-[180px] w-[180px]">
              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <button
                  onClick={addBookmark}
                  className="tap-target inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-foreground hover:bg-secondary/80"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  Add bookmark
                </button>
                <button
                  onClick={cycleSleep}
                  className="tap-target inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-foreground hover:bg-secondary/80"
                >
                  <TimerReset className="w-4 h-4" />
                  Sleep: {sleepMinutes > 0 ? `${sleepMinutes}m` : "Off"}
                </button>
              </div>

              {bookmarks.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Bookmarks</p>
                  <div className="flex flex-wrap gap-2">
                    {bookmarks.map((bm) => (
                      <button
                        key={bm}
                        onClick={() => {
                          if (audioRef.current) {
                            audioRef.current.currentTime = bm;
                            void audioRef.current.play();
                          }
                        }}
                        className="tap-target rounded-md bg-secondary/60 px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary"
                      >
                        {formatTime(bm)}
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
                      className="w-full tap-target rounded-lg bg-secondary/50 hover:bg-secondary px-3 py-2 text-left flex items-center justify-between text-sm"
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
              className="tap-target w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
              aria-label={isPlaying ? "Pause" : "Play"}
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
                className="w-full accent-primary"
                aria-label="Seek"
              />
            </div>

            <button
              onClick={cycleSpeed}
              className="tap-target rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/80"
              aria-label="Playback speed"
            >
              {speed}x
            </button>

            <button
              onClick={cycleSleep}
              className="tap-target rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 hidden sm:inline-flex items-center gap-1.5"
              aria-label="Sleep timer"
            >
              <Clock3 className="w-4 h-4" />
              {sleepMinutes > 0 ? `${sleepMinutes}m` : "Sleep"}
            </button>

            <button
              onClick={() => setExpanded((v) => !v)}
              className="tap-target w-11 h-11 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 inline-flex items-center justify-center"
              aria-label={expanded ? "Collapse player" : "Expand player"}
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
