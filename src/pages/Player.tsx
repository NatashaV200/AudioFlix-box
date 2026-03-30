import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import WaveformVisualizer from "@/components/content/WaveformVisualizer";
import SoundwaveReaction from "@/components/SoundwaveReaction";
import CoListeningRoom from "@/components/CoListening/CoListeningRoom";
import { contentData } from "@/data/content";
import { ArrowLeft, Star, Clock, Tag, Headphones } from "lucide-react";

interface CoListener {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

const Player = () => {
  const { id } = useParams<{ id: string }>();
  const item = contentData.find((c) => c.id === id);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const frameRef = useRef<number | null>(null);
  const [hasReacted, setHasReacted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnergy, setAudioEnergy] = useState(0.12);
  const [coListeners, setCoListeners] = useState<CoListener[]>([
    { id: "user-2", name: "Alex", avatar: "🎵", color: "#ec4899" },
    { id: "user-3", name: "Jordan", avatar: "🎧", color: "#a855f7" },
  ]);
  const [roomId] = useState(`listen-${id}-${Date.now()}`);

  useEffect(() => {
    if (!item || item.type !== "audio") {
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const stopEnergyLoop = () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      setAudioEnergy(0.12);
    };

    const tick = () => {
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;

      if (!analyser || !dataArray) {
        return;
      }

      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((acc, value) => acc + value, 0) / dataArray.length;
      const normalized = average / 255;

      setAudioEnergy((prev) => prev * 0.82 + normalized * 0.18);
      frameRef.current = requestAnimationFrame(tick);
    };

    const setupAnalyzer = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new window.AudioContext();
        }

        if (audioContextRef.current.state === "suspended") {
          await audioContextRef.current.resume();
        }

        if (!sourceRef.current) {
          sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
        }

        if (!analyserRef.current) {
          const analyser = audioContextRef.current.createAnalyser();
          analyser.fftSize = 256;
          sourceRef.current.connect(analyser);
          analyser.connect(audioContextRef.current.destination);
          analyserRef.current = analyser;
          dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        }

        if (!frameRef.current) {
          frameRef.current = requestAnimationFrame(tick);
        }
      } catch {
        setAudioEnergy(0.22);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setupAnalyzer();
    };

    const handlePause = () => {
      setIsPlaying(false);
      stopEnergyLoop();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      stopEnergyLoop();
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      stopEnergyLoop();
    };
  }, [item]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleInvite = () => {
    navigator.clipboard.writeText(`Join me listening on AudioFlix! ${window.location.href}`);
    alert("Invite link copied to clipboard!");
  };

  const handleReaction = (emoji: string) => {
    console.log(`User reacted with ${emoji}`);
  };

  const handleLeaveRoom = () => {
    setCoListeners([]);
  };

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-6">
            <span className="text-3xl">🎬</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">Content Not Found</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            The content you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Content
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <main className="pt-20 pb-12 max-w-5xl mx-auto px-4 md:pl-24">
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </Link>

        {/* Player */}
        <div className="rounded-2xl overflow-hidden bg-card border border-border/50 card-shine">
          {item.type === "video" ? (
            <video
              controls
              className="w-full aspect-video bg-muted"
              poster={item.thumbnail}
              src={item.src}
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <div className={`relative flex flex-col items-center justify-center py-20 gap-8 audio-hero-stage ${isPlaying ? "is-playing" : ""}`}>
              <div className="absolute inset-0 opacity-20">
                <img src={item.thumbnail} alt="" className="w-full h-full object-cover blur-3xl" />
              </div>

              <div
                className="audio-ambient-glow"
                aria-hidden="true"
                style={{
                  opacity: 0.22 + Math.min(audioEnergy, 0.8) * 0.55,
                  transform: `translate(-50%, -50%) scale(${1 + audioEnergy * 0.16})`,
                }}
              />

              <div className="relative audio-cover-stage">
                <div className="audio-vinyl-disc" aria-hidden="true" />
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="audio-cover-art w-48 h-48 md:w-56 md:h-56 rounded-2xl object-cover shadow-2xl shadow-primary/20"
                  style={{ transform: `translateZ(0) scale(${1 + audioEnergy * 0.03})` }}
                />
              </div>

              <div className="relative inline-flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 border border-border/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Headphones className="w-4 h-4" />
                <span>{isPlaying ? "Immersive mode active" : "Press play for living album art"}</span>
              </div>

              <div className="relative w-full max-w-lg space-y-3">
                <WaveformVisualizer
                  audioRef={audioRef}
                  isPlaying={isPlaying}
                  audioEnergy={audioEnergy}
                />
                <div className="flex items-center justify-center gap-3 px-2">
                  <button
                    onClick={() => {
                      const audio = audioRef.current;
                      if (audio) {
                        if (isPlaying) {
                          audio.pause();
                        } else {
                          audio.play();
                        }
                      }
                    }}
                    className="w-12 h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center glow-primary"
                  >
                    {isPlaying ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <span className="text-xs font-medium text-muted-foreground">Click waveform to seek</span>
                </div>
              </div>

              <audio ref={audioRef} className="hidden" src={item.src}>
                Your browser does not support audio playback.
              </audio>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {item.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {item.rating && (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-gold bg-gold/10 px-3 py-1.5 rounded-lg">
                <Star className="w-4 h-4 fill-current" />
                {item.rating}
              </span>
            )}
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg ${
              item.type === "audio" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
            }`}>
              {item.type === "audio" ? "Audiobook" : "Video"}
            </span>
            {item.year && (
              <span className="text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
                {item.year}
              </span>
            )}
            {item.duration && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                {item.duration}
              </span>
            )}
            {item.genre && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
                <Tag className="w-3.5 h-3.5" />
                {item.genre}
              </span>
            )}
          </div>

          {/* Soundwave Reaction */}
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-border/40">
            <span className="text-sm font-semibold text-foreground">How did you enjoy this?</span>
            <SoundwaveReaction 
              size="md" 
              isReacted={hasReacted}
              onReact={() => setHasReacted(!hasReacted)}
            />
          </div>

          {/* Co-Listening Sessions */}
          <CoListeningRoom
            roomId={roomId}
            listeners={coListeners}
            currentUserId="user-1"
            onReact={handleReaction}
            onInvite={handleInvite}
            onLeave={handleLeaveRoom}
          />
        </div>
      </main>
      <Footer className="md:pl-24" />
    </div>
  );
};

export default Player;
