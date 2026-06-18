import { Category } from '../types';

interface CategoryBarProps {
  categories: Category[];
  activeCategory: Category;
  onSelect: (category: Category) => void;
  theme?: string;
}

export default function CategoryBar({ categories, activeCategory, onSelect, theme }: CategoryBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-4 no-scrollbar">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`shrink-0 rounded-full px-5 py-2 text-xs font-bold transition-all ${
            activeCategory === category
              ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
              : theme === 'dark' 
                ? "bg-zinc-900 text-zinc-500 hover:bg-zinc-800" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
