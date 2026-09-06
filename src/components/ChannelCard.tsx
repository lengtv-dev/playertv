import React from 'react';
import { Star, Bookmark, Play, Radio } from 'lucide-react';
import { Channel } from '../types';

interface ChannelCardProps {
  channel: Channel;
  isActive: boolean;
  isFavorite: boolean;
  isWatchLater: boolean;
  onSelect: (channel: Channel) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onToggleWatchLater: (id: string, e: React.MouseEvent) => void;
  smartTVMode?: boolean;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isActive,
  isFavorite,
  isWatchLater,
  onSelect,
  onToggleFavorite,
  onToggleWatchLater,
  smartTVMode = false,
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(channel)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(channel);
        }
      }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all text-left outline-none cursor-pointer ${
        isActive
          ? 'border-blue-500 bg-blue-600/15 ring-2 ring-blue-500/40 shadow-[0_0_25px_rgba(37,99,235,0.25)] scale-[1.02]'
          : 'border-white/5 bg-[#0a0a0a] hover:border-white/20 hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(37,99,235,0.15)]'
      } ${smartTVMode ? 'p-4' : 'p-3.5'}`}
    >
      {/* Top Banner with Badges & Action Buttons */}
      <div className="flex items-start justify-between gap-2">
        {/* Poster / Logo */}
        <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-black border border-white/10 p-1.5 shrink-0 overflow-hidden shadow-inner">
          <img
            src={channel.logo}
            alt={channel.name}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                channel.name
              )}&background=0a0a0a&color=ffffff`;
            }}
            className="h-full w-full object-contain transition-transform group-hover:scale-105"
          />
          {isActive && (
            <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-xs flex items-center justify-center">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>
          )}
        </div>

        {/* Favorite & Watch Later Icon Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => onToggleWatchLater(channel.id, e)}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
              isWatchLater
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-white/40 hover:bg-white/10 hover:text-white opacity-70 group-hover:opacity-100'
            }`}
            title={isWatchLater ? 'Remove from Watch Later' : 'Watch Later'}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isWatchLater ? 'fill-sky-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={(e) => onToggleFavorite(channel.id, e)}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
              isFavorite
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-[0_0_10px_rgba(37,99,235,0.3)]'
                : 'text-white/40 hover:bg-white/10 hover:text-white opacity-70 group-hover:opacity-100'
            }`}
            title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <Star className={`h-3.5 w-3.5 ${isFavorite ? 'fill-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Channel Name & Details */}
      <div className="mt-3 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h4
            className={`text-sm font-semibold truncate transition-colors ${
              isActive ? 'text-blue-400 font-bold' : 'text-white/90 group-hover:text-white'
            }`}
          >
            {channel.name}
          </h4>
          {channel.resolution && (
            <span className="bg-blue-600 text-white font-mono text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shadow-[0_0_6px_rgba(37,99,235,0.3)]">
              {channel.resolution}
            </span>
          )}
        </div>

        <p className="mt-1 text-[11px] text-white/50 line-clamp-1">
          {channel.currentProgram || channel.groupTitle || 'ถ่ายทอดสด Live'}
        </p>
      </div>

      {/* Bottom Footer Info */}
      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-white/40">
        <span className="flex items-center gap-1.5">
          <Radio className="h-2.5 w-2.5 text-red-500 animate-pulse" />
          <span className="truncate max-w-[110px]">{channel.groupTitle || 'Live'}</span>
        </span>

        <span
          className={`flex items-center gap-1 font-medium transition-colors ${
            isActive ? 'text-blue-400 font-bold' : 'text-white/40 group-hover:text-white'
          }`}
        >
          <Play className="h-2.5 w-2.5 fill-current" />
          {isActive ? 'Watching' : 'Watch'}
        </span>
      </div>
    </div>
  );
};
