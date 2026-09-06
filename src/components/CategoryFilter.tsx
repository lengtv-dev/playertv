import React from 'react';
import {
  Trophy,
  Tv,
  Film,
  Smile,
  Compass,
  Newspaper,
  Sparkles,
  Layers,
  Star,
  Bookmark,
  PlusSquare,
} from 'lucide-react';
import { CategoryKey } from '../types';

interface CategoryFilterProps {
  selectedCategory: CategoryKey;
  onSelectCategory: (cat: CategoryKey) => void;
  categoryCounts: Record<string, number>;
  favoritesCount: number;
  watchLaterCount: number;
}

interface CategoryItem {
  key: CategoryKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryItem[] = [
  { key: 'all', label: 'All Channels', icon: Layers },
  { key: 'favorites', label: 'Favorites', icon: Star },
  { key: 'watch_later', label: 'Watch Later', icon: Bookmark },
  { key: 'sports', label: 'Sports & Live Ball', icon: Trophy },
  { key: 'thaidigtv', label: 'Thai Digital TV', icon: Tv },
  { key: 'movies', label: 'Movies & Series', icon: Film },
  { key: 'anime', label: 'Anime & Cartoons', icon: Smile },
  { key: 'documentary', label: 'Documentaries', icon: Compass },
  { key: 'news', label: 'News Live', icon: Newspaper },
  { key: 'variety', label: 'Entertainment', icon: Sparkles },
  { key: 'custom', label: 'Custom Imported', icon: PlusSquare },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  favoritesCount,
  watchLaterCount,
}) => {
  return (
    <div className="w-full border-b border-white/10 bg-[#070707]/90 backdrop-blur-xs py-2.5 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.key;
          let count = categoryCounts[cat.key] || 0;
          if (cat.key === 'favorites') count = favoritesCount;
          if (cat.key === 'watch_later') count = watchLaterCount;

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelectCategory(cat.key)}
              className={`group flex shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.35)] border border-blue-500'
                  : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 transition-colors ${
                  isSelected ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                }`}
              />
              <span>{cat.label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono leading-none ${
                    isSelected
                      ? 'bg-black/30 text-white font-bold'
                      : 'bg-white/10 text-white/50 group-hover:text-white/80'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
