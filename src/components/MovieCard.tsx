import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
  theme?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, isFavorited, onToggleFavorite, theme }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group relative flex flex-col gap-1 rounded-[32px] cursor-pointer p-2 transition-all duration-300 ${theme === 'dark' ? 'bg-zinc-900/20 hover:bg-zinc-900/40 border border-white/5' : 'bg-slate-50/50 hover:bg-slate-50 border border-slate-100'}`}
    >
      <div className={`relative aspect-video overflow-hidden rounded-[26px] border-2 shadow-sm transition-all duration-300 group-hover:scale-[1.01] ${theme === 'dark' ? 'border-zinc-800 shadow-black' : 'border-white shadow-slate-200'}`}>
        <img
          src={movie.thumbnail}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(movie.id);
          }}
          className="absolute top-2 right-2 rounded-full bg-black/40 p-2.5 backdrop-blur-md transition-all hover:bg-red-600 active:scale-90 group/heart z-10"
        >
          <Heart 
            className={`h-4.5 w-4.5 transition-all ${
              isFavorited ? 'fill-red-500 stroke-red-500 scale-110' : 'stroke-white'
            }`} 
          />
        </button>

        {movie.isPremium && (
          <div className="absolute top-3 left-3 rounded-lg bg-yellow-500 px-2.5 py-1 text-[9px] font-black text-black uppercase shadow-xl z-10 tracking-widest border border-yellow-300/50">
            VIP
          </div>
        )}
      </div>

      <div className="px-1.5 py-2.5">
        <div className="flex gap-3 text-left">
          <div className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center overflow-hidden border shadow-inner transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950 border-white/10' : 'bg-white border-slate-200'}`}>
            <div className="text-[10px] font-black text-red-600 italic">KV</div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`line-clamp-2 text-[14px] font-extrabold leading-[1.3] tracking-tight transition-colors duration-300 ${theme === 'dark' ? 'text-zinc-100' : 'text-slate-900 font-black'}`}>
              {movie.title}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 uppercase tracking-[0.1em]">
              <span className="truncate">KOCHI VISION</span>
              <span className="shrink-0 text-red-500/50">•</span>
              <span className="truncate">{movie.category}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
