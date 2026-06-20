import React, { useState, useEffect } from 'react';
import { Bell, Search as SearchIcon, Heart, Play } from 'lucide-react';
import CategoryBar from './CategoryBar';
import Carousel from './Carousel';
import MovieCard from './MovieCard';
import UnlockModal from './UnlockModal';
import { Category, Movie, Banner } from '../types';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { AnimatePresence, motion } from 'motion/react';

export default function HomeView({ user, movies, banners, loading, favorites, onToggleFavorite, onMovieClick, t, theme, lang, categories }: { user: any, movies: Movie[], banners: Banner[], loading: boolean, favorites: string[], onToggleFavorite: (id: string) => void, onMovieClick: (movie: Movie) => void, t: any, theme: string, lang: string, categories: string[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const filteredMovies = (activeCategory === 'All' 
    ? movies 
    : movies.filter(m => (m.category || '').toString().trim().toLowerCase() === activeCategory.toString().trim().toLowerCase()))
    .filter(m => !m.isUpcoming)
    .filter(m => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(query) || 
        (m.customId && m.customId.toLowerCase().includes(query))
      );
    });

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950' : 'bg-white'}`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-4 pt-4 sticky top-0 z-50 pb-2 transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950/80 backdrop-blur-lg' : 'bg-white/80 backdrop-blur-lg'}`}>
        <div className="flex items-center gap-1">
          <h1 className={`text-xl font-black flex items-center tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            𝗣𝗥𝗘𝗠𝗜𝗨𝗠 <span className="ml-1 rounded-md bg-red-600 px-1.5 py-0.5 font-black text-sm text-white italic">𝗩𝗜𝗥𝗔𝗟</span> 𝗩𝗜𝗗𝗘𝗢
          </h1>
        </div>
        <div className="flex items-center">
          <div className={`flex items-center gap-1.5 rounded-full border p-1 pr-3 shadow-sm transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
             <div className="relative">
               {user?.photo_url ? (
                 <img src={user.photo_url} alt="" className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm" referrerPolicy="no-referrer" />
               ) : (
                 <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-tr from-orange-400 to-red-600 text-[10px] font-bold text-white shadow-sm">
                   {user?.first_name?.charAt(0) || 'T'}
                 </div>
               )}
               <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
             </div>
             <div className="flex flex-col">
               <span className={`text-[10px] font-black italic tracking-tighter leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                 ⟨ {user?.first_name || 'TRADER TAMI...'}
               </span>
               {user?.username && <span className="text-[8px] font-medium text-slate-400 leading-none">@{user.username}</span>}
             </div>
          </div>
        </div>
      </header>

      {/* Categories */}
      <CategoryBar categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} theme={theme} />

      {/* Banner */}
      {(banners.length > 0 || loading) && (
        <div className="px-4">
          {loading ? (
            <div className={`h-48 w-full animate-pulse rounded-3xl mt-2 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-slate-100'}`} />
          ) : (
            <Carousel banners={banners} theme={theme} t={t} />
          )}
        </div>
      )}

      {/* Movie List */}
      <div className={`mt-8 px-4 transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className={`text-lg font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{t.recommended}</h2>
          <div className="flex items-center gap-2">
            {isSearching && (
              <motion.input
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 150, opacity: 1 }}
                type="text"
                placeholder={lang === 'bn' ? 'সার্চ করুন...' : 'Search...'}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-full outline-none border transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            )}
            <button 
              onClick={() => {
                setIsSearching(!isSearching);
                if (isSearching) setSearchQuery('');
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${theme === 'dark' ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-slate-100 hover:bg-slate-200'}`}
            >
               <SearchIcon className={`h-4 w-4 ${isSearching ? 'text-red-500' : 'text-slate-400'}`} />
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="space-y-8 w-full max-w-md">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col gap-3 animate-pulse">
                  <div className={`aspect-video w-full rounded-[24px] ${theme === 'dark' ? 'bg-zinc-900' : 'bg-slate-100'}`} />
                  <div className={`h-4 w-3/4 rounded-full mx-1 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-slate-100'}`} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-1 gap-6 w-full max-w-md">
              {filteredMovies.map(movie => (
                <div key={movie.id} onClick={() => onMovieClick(movie)} className="cursor-pointer">
                  <MovieCard 
                    movie={movie} 
                    isFavorited={favorites.includes(movie.id)}
                    onToggleFavorite={onToggleFavorite}
                    theme={theme}
                    lang={lang}
                  />
                </div>
              ))}
              
              {filteredMovies.length === 0 && (
                <div className="py-20 text-center opacity-30 flex flex-col items-center">
                   <div className="text-4xl mb-4">🎬</div>
                   <p className={`text-sm font-black uppercase tracking-widest leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t.noMovies}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
