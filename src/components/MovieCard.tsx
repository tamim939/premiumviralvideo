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
      className="group relative flex flex-col gap-3 rounded-3xl"
    >
      <div className={`relative aspect-video overflow-hidden rounded-[24px] border-4 shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'border-zinc-900' : 'border-slate-100'}`}>
        <img
          src={movie.thumbnail}
          alt={movie.title}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(movie.id);
          }}
          className="absolute top-2 right-2 rounded-full bg-black/30 p-2.5 backdrop-blur-md transition-colors hover:bg-slate-800/40 group/heart active:bg-red-500"
        >
          <Heart 
            className={`h-5 w-5 transition-all group-active/heart:scale-125 ${
              isFavorited ? 'fill-red-500 text-red-500' : 'text-white'
            }`} 
          />
        </button>

        {movie.isPremium && (
          <div className="absolute top-3 left-3 rounded-md bg-yellow-500 px-2 py-0.5 text-[10px] font-bold text-black uppercase shadow-lg">
            VIP
          </div>
        )}
      </div>

      <div className="px-1 mt-1">
        <h3 className={`line-clamp-2 text-sm font-black transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
          {movie.title}
        </h3>
      </div>
    </motion.div>
  );
};

export default MovieCard;
