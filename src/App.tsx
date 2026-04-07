/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { RadioPlayer } from './components/RadioPlayer';
import { Chat } from './components/Chat';
import { SongRequests } from './components/SongRequests';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Radio } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(auth.currentUser);
  const [activeTab, setActiveTab] = useState<'chat' | 'requests'>('chat');
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Ensure user document exists in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          try {
            await setDoc(userRef, {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'Ouvinte',
              photoURL: currentUser.photoURL || '',
              email: currentUser.email || '',
              role: 'listener'
            });
          } catch (error) {
            console.error("Error creating user document:", error);
          }
        }
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-orange-500 flex flex-col items-center">
          <Radio className="w-12 h-12 mb-4 animate-bounce" />
          <p>Carregando Rádio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-orange-500/30 scrollbar-hide">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Left Column: Player */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
            <RadioPlayer />
            
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 text-sm text-zinc-400">
              <h3 className="text-white font-semibold mb-2">Sobre o App</h3>
              <p className="mb-4">
                Este é o reprodutor oficial da nossa web rádio. Ouça a programação ao vivo, interaja com outros ouvintes no chat e peça suas músicas favoritas!
              </p>
              <p>
                Para os administradores: As músicas pedidas aparecerão na lista e podem ser marcadas como "Tocada" no painel de controle (a ser implementado).
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Features */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            {/* Tabs */}
            <div className="flex w-full sm:w-auto gap-2 mb-4 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 inline-flex">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'chat' 
                    ? 'bg-zinc-800 text-white shadow-sm' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                Chat ao Vivo
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'requests' 
                    ? 'bg-zinc-800 text-white shadow-sm' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                Pedir Música
              </button>
            </div>

            {/* Tab Content */}
            <div className="transition-all duration-300 ease-in-out flex-1">
              {activeTab === 'chat' ? <Chat /> : <SongRequests />}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
