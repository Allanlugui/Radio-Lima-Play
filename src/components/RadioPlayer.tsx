import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export function RadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Placeholder stream URL. The user should replace this with their actual Icecast/Shoutcast stream URL.
  // We use a public test stream here.
  const streamUrl = "https://stream.zeno.fm/f3wvbbqmdg8uv";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="bg-zinc-900 text-white rounded-2xl p-6 shadow-2xl flex flex-col items-center w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-orange-500">Rádio Ao Vivo</h2>
      <p className="text-zinc-400 mb-8 text-sm text-center">
        Conectado a: <a href="https://minha-r-dio.vercel.app/" target="_blank" rel="noreferrer" className="text-orange-400 hover:underline">minha-r-dio.vercel.app</a>
      </p>

      <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
        <div className={`absolute inset-0 rounded-full border-4 border-orange-500/30 ${isPlaying ? 'animate-ping' : ''}`}></div>
        <div className="absolute inset-2 rounded-full bg-zinc-800 flex items-center justify-center shadow-inner">
          <button
            onClick={togglePlay}
            className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/50"
          >
            {isPlaying ? (
              <Pause className="w-10 h-10 text-white fill-current" />
            ) : (
              <Play className="w-10 h-10 text-white fill-current ml-2" />
            )}
          </button>
        </div>
      </div>

      <div className="w-full flex items-center gap-4 px-4">
        <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition-colors">
          {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            if (isMuted) setIsMuted(false);
          }}
          className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
      </div>

      <audio ref={audioRef} src={streamUrl} preload="none" />
      
      <div className="mt-6 text-xs text-zinc-500 text-center">
        * Nota: Substitua a URL do stream no código pelo link de áudio real da sua web rádio.
      </div>
    </div>
  );
}
