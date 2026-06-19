/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Splash from './components/Splash';
import HomeView from './components/HomeView';
import AdminPanel from './components/AdminPanel';
import ProfileView from './components/ProfileView';
import AdminLogin from './components/AdminLogin';
import BottomNav, { TabId } from './components/BottomNav';
import { getTelegramUser, expandTelegramWebApp } from './lib/telegram';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import MovieCard from './components/MovieCard';
import UnlockModal from './components/UnlockModal';
import { Movie, Banner } from './types';
import { db } from './lib/firebase';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { translations, Language } from './translations';

const ADMINS = [
  { username: 'TRADER_TAMIM_3', id: '7228630025' },
  { username: 'SAMIYA398', id: '6827786651' }
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  
  // New States
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('app_theme') as 'light' | 'dark') || 'light';
  });
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('app_lang') as Language) || 'bn';
  });
  const [categories, setCategories] = useState<string[]>([]);

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  useEffect(() => {
    // Monitor categories
    const unsubscribeCategories = onSnapshot(doc(db, "settings", "categories"), (docSnap) => {
      const forbiddenCategories = ['18+', 'Sax', 'Adult', 'Sex', '18+ Movie', '18+ Series'];
      if (docSnap.exists()) {
        const list = docSnap.data().list || [];
        // Filter out categories that start with forbidden keywords or contain them
        const filteredList = list.filter((c: string) => 
          !forbiddenCategories.some(f => c.toLowerCase().includes(f.toLowerCase())) &&
          !c.includes('🔞') && !c.includes('🔞 Sax')
        );
        setCategories(filteredList);
      } else {
        // Initialize once maybe? We'll handle this in AdminPanel or here
        setCategories(['All', 'Movie', 'CID', 'Bachelor Point', 'Series', 'Others']);
      }
    });

    return () => unsubscribeCategories();
  }, []);

  useEffect(() => {
    // Monitor Movies from Firestore
    const q = query(collection(db, "movies"), orderBy("createdAt", "desc"));
    const forbiddenCategories = ['18+', 'Sax', 'Adult', 'Sex', '18+ Movie', '18+ Series'];
    const unsubscribeMovies = onSnapshot(q, (snapshot) => {
      const moviesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      })) as Movie[];
      
      const filteredMovies = moviesData.filter(m => 
        !forbiddenCategories.some(f => m.category.toLowerCase().includes(f.toLowerCase())) &&
        !m.category.includes('🔞')
      );
      
      setMovies(filteredMovies);
    });

    return () => unsubscribeMovies();
  }, []);

  useEffect(() => {
    // Monitor Banners from Firestore
    const q = query(collection(db, "banners"), orderBy("createdAt", "desc"));
    const unsubscribeBanners = onSnapshot(q, (snapshot) => {
      const bannersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      })) as Banner[];
      setBanners(bannersData);
    });

    return () => unsubscribeBanners();
  }, []);

  useEffect(() => {
    // Load local favorites if any
    const savedFavorites = localStorage.getItem('movie_favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }
    
    // Initialize Telegram
    expandTelegramWebApp();
    const tgUser = getTelegramUser();
    
    if (tgUser) {
      setUser(tgUser);
      console.log('Telegram User from WebApp:', tgUser);
      
      const isAdminID = ADMINS.some(admin => 
        (admin.id && String(tgUser.id) === admin.id)
      );
      
      if (!isAdminID) {
        setIsAdmin(false);
        localStorage.removeItem('is_admin_active');
      } else {
        const wasActive = localStorage.getItem('is_admin_active') === 'true';
        if (!wasActive) {
          setIsAdmin(false);
        }
      }
    } else {
      // Fallback: check URL for user_id (only for preview/dev visual, status is cleared later if mismatch)
      const urlParams = new URL(window.location.href).searchParams;
      const urlUserId = urlParams.get('user_id');
      if (urlUserId) {
        const mockUser = { id: urlUserId, source: 'url' };
        setUser(mockUser);
      }
    }

    // Monitor Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const tgUserLocal = getTelegramUser();
      const isAdminID = ADMINS.some(admin => 
        (admin.id && String(tgUserLocal?.id) === admin.id)
      );

      // Even if firebase user is logged in, we MUST verify the current TG user is an admin
      if (firebaseUser && isAdminID) {
        setIsAdmin(true);
        localStorage.setItem('is_admin_active', 'true');
      } else {
        // Otherwise, they are NOT an admin on THIS account
        setIsAdmin(false);
        localStorage.removeItem('is_admin_active');
        // If they were logged into Firebase on a WRONG account, sign them out
        if (firebaseUser) {
          signOut(auth);
        }
      }
    });

    return () => unsubscribe();
  }, []);


  const toggleFavorite = (movieId: string) => {
    setFavorites(prev => {
      const newFavs = prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId];
      
      localStorage.setItem('movie_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const handleAdminSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('is_admin_active', 'true');
    setShowAdminLogin(false);
    setActiveTab('search'); // Go to admin panel
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdmin(false);
    localStorage.removeItem('is_admin_active');
    setActiveTab('home');
  };

  const isSpecialUser = ADMINS.some(admin => 
    (admin.username && user?.username === admin.username) || 
    (admin.id && String(user?.id) === admin.id)
  ) || !user?.id; // Allow in preview for dev

  return (
    <div className={`min-h-screen selection:bg-red-600/30 transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-white text-slate-900'}`}>
      <AnimatePresence>
        {showSplash && (
          <Splash onFinish={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {!showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`relative mx-auto max-w-md min-h-screen shadow-2xl transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950' : 'bg-white'}`}
        >
          {showAdminLogin ? (
            <AdminLogin 
              onSuccess={handleAdminSuccess} 
              onCancel={() => setShowAdminLogin(false)} 
            />
          ) : (
            <div className="h-screen overflow-y-auto no-scrollbar pb-32">
              {activeTab === 'home' && (
                <HomeView 
                  user={user} 
                  movies={movies}
                  banners={banners}
                  loading={movies.length === 0}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onMovieClick={setSelectedMovie}
                  t={t}
                  theme={theme}
                  lang={lang}
                  categories={categories}
                />
              )}
              {activeTab === 'search' && (
                isAdmin ? (
                  <AdminPanel 
                    onLogout={handleLogout} 
                    user={user} 
                    theme={theme}
                    categories={categories} 
                  />
                ) : (
                  <div className={`flex h-[80vh] flex-col items-center justify-center gap-4 text-center px-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950' : 'bg-white'}`}>
                    <div className={`rounded-full p-8 shadow-inner ${theme === 'dark' ? 'bg-zinc-900 shadow-white/5' : 'bg-slate-50 shadow-black/5'}`}>
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-4xl"
                      >
                         🔍
                      </motion.div>
                    </div>
                    <h2 className={`text-xl font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                      {t.search} {t.comingSoon}
                    </h2>
                    <p className={`text-sm font-medium max-w-[200px] ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>We are working on bringing the best search experience for you.</p>
                  </div>
                )
              )}
              {activeTab === 'upcoming' && (
                <div className={`px-4 pt-8 min-h-screen transition-colors duration-300 flex flex-col items-center ${theme === 'dark' ? 'bg-zinc-950' : 'bg-white'}`}>
                  <div className="w-full max-w-md">
                    <h2 className={`text-2xl font-black mb-8 uppercase tracking-tighter px-1 flex items-center justify-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                      {t.upcoming} <span className="text-red-500">🔥</span>
                    </h2>
                    {movies.filter(m => m.isUpcoming).length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {movies.filter(m => m.isUpcoming).map(movie => (
                          <div key={movie.id} onClick={() => setSelectedMovie(movie)}>
                            <MovieCard 
                              movie={movie} 
                              isFavorited={favorites.includes(movie.id)}
                              onToggleFavorite={toggleFavorite}
                              theme={theme}
                              lang={lang}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center gap-6 opacity-30">
                         <div className="text-7xl">🎬</div>
                         <p className={`font-black uppercase tracking-[0.2em] text-xs ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>কোনো পোস্ট পাওয়া যায়নি</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'favorite' && (
                <div className={`px-4 pt-8 min-h-screen transition-colors duration-300 flex flex-col items-center ${theme === 'dark' ? 'bg-zinc-950' : 'bg-white'}`}>
                  <div className="w-full max-w-md">
                    <h2 className={`text-2xl font-black mb-8 uppercase tracking-tighter px-1 flex items-center justify-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                      {t.favorite} <span className="text-red-500">❤️</span>
                    </h2>
                    {favorites.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {movies.filter(m => favorites.includes(m.id)).map(movie => (
                          <div key={movie.id} onClick={() => setSelectedMovie(movie)}>
                            <MovieCard 
                              movie={movie} 
                              isFavorited={true}
                              onToggleFavorite={toggleFavorite}
                              theme={theme}
                              lang={lang}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center gap-6 opacity-30">
                         <div className="text-7xl">💔</div>
                         <p className={`font-black uppercase tracking-[0.2em] text-xs ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t.emptyList}</p>
                         <button onClick={() => setActiveTab('home')} className="mt-2 text-red-600 font-black text-sm uppercase tracking-widest border-b-2 border-red-600 pb-1">{t.browse}</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'profile' && (
                <ProfileView 
                  user={user} 
                  onGoHome={() => setActiveTab('home')}
                  isAdmin={isAdmin}
                  canAccessAdmin={ADMINS.some(admin => (admin.id && String(user?.id) === admin.id))}
                  onLogout={handleLogout}
                  onTriggerAdminLogin={() => setShowAdminLogin(true)}
                  theme={theme}
                  setTheme={setTheme}
                  lang={lang}
                  setLang={setLang}
                  t={t}
                />
              )}

              <BottomNav 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                userPhoto={user?.photo_url}
                isAdmin={isAdmin}
                theme={theme}
                t={t}
              />
            </div>
          )}

          <AnimatePresence>
            {selectedMovie && (
              <UnlockModal 
                movie={selectedMovie} 
                onClose={() => setSelectedMovie(null)} 
                t={t}
                theme={theme}
                user={user}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
