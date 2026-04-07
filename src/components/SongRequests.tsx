import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Music, CheckCircle2, Clock } from 'lucide-react';

interface SongRequest {
  id: string;
  songName: string;
  artistName: string;
  userId: string;
  userName: string;
  status: 'pending' | 'played';
  createdAt: any;
}

export function SongRequests() {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, 'songRequests'), orderBy('createdAt', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reqs: SongRequest[] = [];
      snapshot.forEach((doc) => {
        reqs.push({ id: doc.id, ...doc.data() } as SongRequest);
      });
      setRequests(reqs);
    }, (error) => {
      console.error("Error fetching song requests:", error);
    });

    return () => unsubscribe();
  }, []);

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songName.trim() || !artistName.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'songRequests'), {
        songName: songName.trim(),
        artistName: artistName.trim(),
        userId: user.uid,
        userName: user.displayName || 'Ouvinte',
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSongName('');
      setArtistName('');
    } catch (error) {
      console.error("Error submitting request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-800">
      <div className="bg-zinc-800 p-4 border-b border-zinc-700">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Music className="w-5 h-5 text-orange-500" />
          Pedir Música
        </h3>
      </div>
      
      <div className="p-4 border-b border-zinc-800">
        {user ? (
          <form onSubmit={submitRequest} className="space-y-3">
            <div>
              <input
                type="text"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                placeholder="Nome da música"
                className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-zinc-700 text-sm"
                maxLength={100}
                required
              />
            </div>
            <div>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Nome do artista/banda"
                className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-zinc-700 text-sm"
                maxLength={100}
                required
              />
            </div>
            <button
              type="submit"
              disabled={!songName.trim() || !artistName.trim() || isSubmitting}
              className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Pedido'}
            </button>
          </form>
        ) : (
          <div className="text-center text-sm text-zinc-400 py-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
            Faça login para pedir músicas
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Últimos Pedidos</h4>
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50 flex items-center justify-between">
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{req.songName}</p>
                <p className="text-xs text-zinc-400 truncate">{req.artistName}</p>
                <p className="text-[10px] text-zinc-500 mt-1">Pedido por: {req.userName}</p>
              </div>
              <div className="flex-shrink-0 ml-3">
                {req.status === 'played' ? (
                  <div className="flex flex-col items-center text-green-500">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-[9px] mt-1">Tocada</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-orange-500">
                    <Clock className="w-5 h-5" />
                    <span className="text-[9px] mt-1">Aguardando</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-4">Nenhum pedido recente.</p>
          )}
        </div>
      </div>
    </div>
  );
}
