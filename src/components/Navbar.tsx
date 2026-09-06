import { Search, SlidersHorizontal, PlusCircle, History, Star, Tv, X } from 'lucide-react';
import React, { useRef, useEffect } from 'react';
import { UserSettings } from '../types';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenImport: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  favoriteCount: number;
  historyCount: number;
  onToggleFavoritesOnly: () => void;
  isFavoritesOnly: boolean;
  settings: UserSettings;
  onToggleTVMode: () => void;
  channelCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenImport,
  onOpenSettings,
  onOpenHistory,
  favoriteCount,
  historyCount,
  onToggleFavoritesOnly,
  isFavoritesOnly,
  settings,
  onToggleTVMode,
  channelCount,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 gap-3">
        {/* Brand Logo - Immersive UI style */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] text-white">
            <Tv className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">
                IPTV<span className="text-blue-500">PRO</span>
              </span>
              <div className="flex items-center gap-1.5 bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-full border border-red-500/20">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold tracking-tight">LIVE</span>
              </div>
            </div>
            <p className="hidden sm:block text-[10px] text-white/40 leading-none mt-0.5">
              {channelCount} ช่องรายการสด & วิดีโอย้อนหลัง
            </p>
          </div>
        </div>

        {/* Search Bar - Immersive rounded-full style */}
        <div className="relative flex-1 max-w-md mx-2">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-white/40" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search channels, sports, movies, or EPG..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-12 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/30"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 p-1 text-white/40 hover:text-white transition-colors"
                title="ล้างคำค้นหา"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-3 hidden sm:inline-flex h-5 items-center rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] text-white/40">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Favorites Filter Button */}
          <button
            type="button"
            onClick={onToggleFavoritesOnly}
            className={`relative flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-medium transition-all ${
              isFavoritesOnly
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-500'
                : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
            title="ช่องรายการโปรด"
          >
            <Star className={`h-3.5 w-3.5 ${isFavoritesOnly ? 'fill-white' : 'text-blue-400'}`} />
            <span className="hidden md:inline">Favorites</span>
            {favoriteCount > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isFavoritesOnly ? 'bg-black/40 text-white' : 'bg-white/10 text-white/80'
                }`}
              >
                {favoriteCount}
              </span>
            )}
          </button>

          {/* Replay & History Drawer Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="relative flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
            title="ประวัติการรับชมและเล่นย้อนหลัง"
          >
            <History className="h-3.5 w-3.5 text-white/60" />
            <span className="hidden md:inline">Recent</span>
            {historyCount > 0 && (
              <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] text-white/60">
                {historyCount}
              </span>
            )}
          </button>

          {/* Import / Playlist Manager (Xtream, W3U, M3U) */}
          <button
            type="button"
            onClick={onOpenImport}
            className="flex h-9 items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-600/15 px-3 text-xs font-medium text-white transition-all hover:bg-blue-600/25 hover:border-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.2)]"
            title="เพิ่มเพลย์ลิสต์ Xtream Codes, Wiseplay w3u หรือ M3U URL"
          >
            <PlusCircle className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden sm:inline">Playlists</span>
            <span className="bg-blue-500/30 text-blue-300 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold">
              XTREAM/W3U
            </span>
          </button>

          {/* TV / Layout Mode Toggle */}
          <button
            type="button"
            onClick={onToggleTVMode}
            className={`hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
              settings.smartTVMode
                ? 'border-blue-500/80 bg-blue-600/20 text-blue-400'
                : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
            title="โหมดสมาร์ตทีวี (TV Mode)"
          >
            <Tv className="h-4 w-4" />
          </button>

          {/* Settings Modal Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white"
            title="ตั้งค่าระบบ / Proxy / เล่นสื่อ"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
