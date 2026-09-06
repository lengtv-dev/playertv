import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Radio,
  Sparkles,
  Star,
  Bookmark,
} from 'lucide-react';
import { Channel } from '../types';

interface ChannelInfoBarProps {
  currentChannel: Channel | null;
  channels: Channel[];
  favorites: string[];
  watchLater: string[];
  onSelectChannel: (channel: Channel) => void;
  onToggleFavorite: (id: string) => void;
  onToggleWatchLater: (id: string) => void;
}

export const ChannelInfoBar: React.FC<ChannelInfoBarProps> = ({
  currentChannel,
  channels,
  favorites,
  watchLater,
  onSelectChannel,
  onToggleFavorite,
  onToggleWatchLater,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -280 : 280;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (!currentChannel) return null;

  const isFav = favorites.includes(currentChannel.id);
  const isWL = watchLater.includes(currentChannel.id);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 sm:p-5 shadow-2xl">
      {/* Current Channel Details & EPG Preview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={currentChannel.logo}
            alt={currentChannel.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                currentChannel.name
              )}&background=050505&color=ffffff`;
            }}
            className="h-12 w-12 rounded-xl object-contain bg-black border border-white/10 p-1.5 shrink-0 shadow-md"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {currentChannel.name}
              </h3>
              <span className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70">
                {currentChannel.groupTitle || 'ถ่ายทอดสด'}
              </span>
              {currentChannel.sourceType === 'xtream' && (
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                  XTREAM
                </span>
              )}
              {currentChannel.sourceType === 'w3u' && (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                  WISEPLAY W3U
                </span>
              )}
              {currentChannel.resolution && (
                <span className="bg-blue-600 text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase shadow-[0_0_10px_rgba(37,99,235,0.4)]">
                  {currentChannel.resolution}
                </span>
              )}
              {currentChannel.backupUrl && (
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-medium px-2 py-0.5 rounded-lg">
                  + สำรอง (url1)
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/50 flex-wrap">
              <span className="flex items-center gap-1.5 text-red-400 font-medium">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                Live Feed
              </span>
              <span>•</span>
              <span className="truncate max-w-[200px] sm:max-w-xs text-white/80">
                {currentChannel.currentProgram || 'ถ่ายทอดสดตามตารางผัง'}
              </span>
              {currentChannel.nextProgram && (
                <>
                  <span>•</span>
                  <span className="text-white/40 hidden md:inline">
                    Up Next: {currentChannel.nextProgram}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => onToggleWatchLater(currentChannel.id)}
            className={`flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition-all ${
              isWL
                ? 'border-sky-500/60 bg-sky-500/20 text-sky-400'
                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isWL ? 'fill-sky-400' : ''}`} />
            <span>{isWL ? 'Saved' : 'Watch Later'}</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleFavorite(currentChannel.id)}
            className={`flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition-all ${
              isFav
                ? 'border-blue-500 bg-blue-600/20 text-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-blue-400' : ''}`} />
            <span>{isFav ? 'Favorited' : 'Favorite'}</span>
          </button>
        </div>
      </div>

      {/* Horizontal Quick Switcher Carousel */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-1.5 font-bold">
            <Sparkles className="h-3 w-3 text-blue-400" />
            Quick Related Channels ({channels.length})
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              title="เลื่อนซ้าย"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              title="เลื่อนขวา"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1"
        >
          {channels.slice(0, 30).map((ch) => {
            const isSelected = ch.id === currentChannel.id;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => onSelectChannel(ch)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2 transition-all text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-600/20 text-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.3)] ring-1 ring-blue-500/40'
                    : 'border-white/5 bg-white/5 text-white/70 hover:border-white/15 hover:bg-white/10 hover:text-white'
                }`}
              >
                <img
                  src={ch.logo}
                  alt={ch.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      ch.name
                    )}&background=0a0a0a&color=ffffff`;
                  }}
                  className="h-6 w-6 rounded-lg object-contain bg-black p-0.5"
                />
                <span className="text-xs font-medium truncate max-w-[130px]">
                  {ch.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
