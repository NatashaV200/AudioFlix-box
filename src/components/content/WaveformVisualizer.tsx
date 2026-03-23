import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

interface WaveformVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  audioEnergy: number;
}

const WaveformVisualizer = ({ audioRef, isPlaying, audioEnergy }: WaveformVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformDataRef = useRef<number[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHoveringWaveform, setIsHoveringWaveform] = useState(false);
  const [hoverX, setHoverX] = useState(0);

  const WAVEFORM_SAMPLES = 256;
  const VISUALIZER_BARS = 64;

  // Generate waveform data by analyzing the entire audio file
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const generateWaveform = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }

        const response = await fetch(audio.src);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

        const rawData = audioBuffer.getChannelData(0);
        const blockSize = Math.floor(rawData.length / WAVEFORM_SAMPLES);
        const samples: number[] = [];

        for (let i = 0; i < WAVEFORM_SAMPLES; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[i * blockSize + j]);
          }
          samples.push(sum / blockSize);
        }

        waveformDataRef.current = samples;
      } catch (error) {
        console.warn("Could not generate waveform from audio file:", error);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      generateWaveform();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [audioRef]);

  // Draw waveform and realtime visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawFrame = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.fillStyle = "hsl(225 12% 10% / 0.4)";
      ctx.fillRect(0, 0, width, height);

      // Draw static waveform
      if (waveformDataRef.current.length > 0) {
        ctx.strokeStyle = "hsl(260 60% 55% / 0.35)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        const centerY = height / 2;
        const barWidth = width / WAVEFORM_SAMPLES;

        for (let i = 0; i < WAVEFORM_SAMPLES; i++) {
          const sample = waveformDataRef.current[i];
          const x = i * barWidth + barWidth / 2;
          const y = centerY - sample * centerY * 0.85;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();

        // Mirror bottom half
        ctx.beginPath();
        for (let i = 0; i < WAVEFORM_SAMPLES; i++) {
          const sample = waveformDataRef.current[i];
          const x = i * barWidth + barWidth / 2;
          const y = centerY + sample * centerY * 0.85;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw progress line
      if (duration > 0) {
        const progressX = (currentTime / duration) * width;

        // Gradient fill for past portion
        const gradient = ctx.createLinearGradient(0, 0, progressX, 0);
        gradient.addColorStop(0, "hsl(348 83% 55% / 0.22)");
        gradient.addColorStop(1, "hsl(348 83% 55% / 0.08)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, progressX, height);

        // Progress indicator
        ctx.fillStyle = "hsl(348 83% 55% / 0.8)";
        ctx.fillRect(progressX - 1.5, 0, 3, height);
      }

      // Draw real-time visualizer bars on top
      if (isPlaying && analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        const barWidth = width / VISUALIZER_BARS;
        const centerY = height / 2;

        for (let i = 0; i < VISUALIZER_BARS; i++) {
          const value = dataArrayRef.current[i] || 0;
          const normalized = value / 255;
          const x = i * barWidth;
          const barHeight = normalized * centerY * 0.9;

          // Top bar
          const hue = 348 + i * (120 / VISUALIZER_BARS);
          ctx.fillStyle = `hsl(${hue} 83% ${45 + normalized * 15}% / ${0.6 + normalized * 0.35})`;
          ctx.fillRect(x + 1, centerY - barHeight, barWidth - 2, barHeight);

          // Bottom bar (mirrored)
          ctx.fillRect(x + 1, centerY, barWidth - 2, barHeight);
        }
      }

      // Draw hover preview line
      if (isHoveringWaveform) {
        ctx.strokeStyle = "hsl(348 83% 55% / 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hoverX, 0);
        ctx.lineTo(hoverX, height);
        ctx.stroke();

        const hoverTime = (hoverX / width) * duration;
        const minutes = Math.floor(hoverTime / 60);
        const seconds = Math.floor(hoverTime % 60);
        const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        ctx.fillStyle = "hsl(348 83% 55% / 0.9)";
        ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
        ctx.textAlign = "center";
        const textX = Math.max(30, Math.min(hoverX, width - 30));
        ctx.fillText(timeStr, textX, 16);
      }

      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    const setupAnalyzer = async () => {
      const audio = audioRef.current;
      if (!audio) return;

      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }

        if (audioContextRef.current.state === "suspended") {
          await audioContextRef.current.resume();
        }

        if (!analyserRef.current) {
          const analyser = audioContextRef.current.createAnalyser();
          analyser.fftSize = 512;

          try {
            const source = audioContextRef.current.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContextRef.current.destination);
          } catch {
            // Already connected
          }

          analyserRef.current = analyser;
          dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        }
      } catch {
        console.warn("Could not setup audio analyzer for waveform");
      }
    };

    if (isPlaying) {
      setupAnalyzer();
    }

    animationFrameRef.current = requestAnimationFrame(drawFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, isHoveringWaveform, hoverX, audioEnergy]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;

    if (!canvas || !audio || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const seekTime = (x / canvas.width) * duration;

    audio.currentTime = Math.max(0, Math.min(seekTime, duration));
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setHoverX(x);
  };

  return (
    <div className="w-full space-y-2">
      <canvas
        ref={canvasRef}
        width={1200}
        height={100}
        onClick={handleCanvasClick}
        onMouseEnter={() => setIsHoveringWaveform(true)}
        onMouseLeave={() => setIsHoveringWaveform(false)}
        onMouseMove={handleCanvasMouseMove}
        className="waveform-canvas w-full h-24 rounded-lg cursor-pointer transition-opacity hover:opacity-100 opacity-90"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, "0")}
        </span>
        <span>
          {Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

export default WaveformVisualizer;
