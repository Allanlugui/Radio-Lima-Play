/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { RadioPlayer } from './components/RadioPlayer';
import { Chat } from './components/Chat';
import { SongRequests } from './components/SongRequests';
import { auth, signInWithGoogle, logOut, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Radio, LogIn, LogOut, User as UserIcon } from 'lucide-react';

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
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-orange-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Web Rádio <span className="text-orange-500">Ao Vivo</span></h1>
          </div>
          
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-zinc-700" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                      <UserIcon className="w-4 h-4 text-zinc-400" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-zinc-300">{user.displayName}</span>
                </div>
                <button 
                  onClick={logOut}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-800"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className="flex items-center gap-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 transition-colors px-4 py-2 rounded-lg shadow-lg shadow-orange-500/20"
              >
                <LogIn className="w-4 h-4" />
                Entrar para Participar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
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
          <div className="lg:col-span-7 xl:col-span-8">
            {/* Tabs */}
            <div className="flex gap-2 mb-4 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 inline-flex">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'chat' 
                    ? 'bg-zinc-800 text-white shadow-sm' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                Chat ao Vivo
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'requests' 
                    ? 'bg-zinc-800 text-white shadow-sm' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                Pedir Música
              </button>
            </div>

            {/* Tab Content */}
            <div className="transition-all duration-300 ease-in-out">
              {activeTab === 'chat' ? <Chat /> : <SongRequests />}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
