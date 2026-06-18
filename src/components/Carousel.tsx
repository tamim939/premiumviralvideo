import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Banner } from '../types';

export default function Carousel({ banners, theme, t }: { banners: Banner[], theme?: string, t: any }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return <div className={`h-40 w-full rounded-3xl flex items-center justify-center text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'bg-zinc-900 text-zinc-700' : 'bg-slate-100 text-slate-400'}`}>No Featured Content</div>;

  const handleClick = (link: string) => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openLink(link);
    } else {
      window.open(link, '_blank');
    }
  };

  return (
    <div className="relative w-full mt-2">
      <div className="relative h-44 w-full overflow-hidden">
        <motion.div 
          animate={{ x: `-${index * 88}%` }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className="flex gap-3 h-full px-4"
        >
          {banners.map((banner, i) => (
            <motion.div
              key={banner.id}
              onClick={() => handleClick(banner.link)}
              className={`relative h-full min-w-[85%] overflow-hidden rounded-[24px] shadow-lg ring-1 ring-black/5 transition-all duration-300 cursor-pointer ${theme === 'dark' ? 'shadow-black/50' : 'shadow-slate-200'} ${i === index ? 'scale-100' : 'scale-[0.98] opacity-90'}`}
              whileTap={{ scale: 0.96 }}
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4">
                 <h2 className="text-[13px] font-black text-white mb-1.5 line-clamp-1 drop-shadow-md">{banner.title}</h2>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Custom Pagination */}
      <div className="mt-3 flex justify-center items-center gap-1.5">
        {banners.map((_, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{ 
              width: i === index ? 24 : 6,
              backgroundColor: i === index ? "#ff4d00" : "#d1d5db"
            }}
            className="h-1.5 rounded-full transition-all duration-300"
          />
        ))}
      </div>
    </div>
  );
}
