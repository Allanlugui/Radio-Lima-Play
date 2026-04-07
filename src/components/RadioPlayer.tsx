import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Peer } from 'peerjs';

export function RadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState('Conectando...');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Conecta ao servidor gratuito do PeerJS
    const peer = new Peer();

    peer.on('open', () => {
      setStatus('Sintonizando...');
      
      // Aqui você coloca o MESMO ID que está no seu Studio!
      const radioId = 'minha-radio-ao-vivo'; 
      
      // Cria um stream de áudio vazio (dummy) para satisfazer o PeerJS
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const dest = ctx.createMediaStreamDestination();
      const dummyStream = dest.stream;
      
      // "Liga" para o Studio para receber o áudio
      const call = peer.call(radioId, dummyStream);

      if (call) {
        call.on('stream', (remoteStream) => {
          if (audioRef.current) {
            audioRef.current.srcObject = remoteStream;
            audioRef.current.play().then(() => {
              setIsPlaying(true);
            }).catch(e => {
              console.log("Aguardando interação do usuário para tocar");
              setIsPlaying(false);
            });
            setStatus('Ao Vivo 🔴');
          }
        });

        call.on('close', () => {
          setStatus('Transmissão encerrada.');
          setIsPlaying(false);
        });
        
        call.on('error', () => {
          setStatus('Rádio offline.');
          setIsPlaying(false);
        });
      } else {
        setStatus('Rádio offline.');
        setIsPlaying(false);
      }
    });

    return () => {
      peer.destroy();
    };
  }, []);

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
        audioRef.current.play().catch(e => console.error("Error playing audio:", e?.message || "Unknown error"));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="bg-zinc-900 text-white rounded-2xl p-6 shadow-2xl flex flex-col items-center w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-orange-500">Rádio Lima Play</h2>
      <p className="text-zinc-400 mb-8 text-sm text-center">
        Status: <strong className={status === 'Ao Vivo 🔴' ? 'text-green-400' : 'text-orange-400'}>{status}</strong>
      </p>

      <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
        <div className={`absolute inset-0 rounded-full border-4 border-orange-500/30 ${isPlaying ? 'animate-ping' : ''}`}></div>
        <div className="absolute inset-2 rounded-full bg-zinc-800 flex items-center justify-center shadow-inner">
          <button
            onClick={togglePlay}
            disabled={status !== 'Ao Vivo 🔴'}
            className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
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

      <audio 
        ref={audioRef} 
        preload="none"
        onError={() => {
          console.error("Audio playback error occurred.");
          setIsPlaying(false);
        }}
      />
    </div>
  );
}
