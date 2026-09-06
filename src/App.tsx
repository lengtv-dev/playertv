import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Channel, CategoryKey, PlaybackHistoryItem, UserSettings, PlaylistSource } from './types';
import { DEFAULT_CHANNELS } from './data/defaultChannels';
import {
  getStoredFavorites,
  saveFavorites,
  getStoredWatchLater,
  saveWatchLater,
  getStoredHistory,
  addToStoredHistory,
  clearStoredHistory,
  getStoredCustomChannels,
  saveCustomChannels,
  getStoredPlaylists,
  savePlaylists,
  getStoredActivePlaylistId,
  saveStoredActivePlaylistId,
  getStoredSettings,
  saveStoredSettings,
  DEFAULT_SETTINGS,
} from './services/storage';
import { Navbar } from './components/Navbar';
import { CategoryFilter } from './components/CategoryFilter';
import { VideoPlayer } from './components/VideoPlayer';
import { ChannelInfoBar } from './components/ChannelInfoBar';
import { ChannelCard } from './components/ChannelCard';
import { M3UImportModal } from './components/M3UImportModal';
import { SettingsModal } from './components/SettingsModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Tv, AlertCircle, Layers, PlusCircle, Server, Radio, FileText } from 'lucide-react';

export default function App() {
  // --- Persistent States from LocalStorage ---
  const [favorites, setFavorites] = useState<string[]>([]);
  const [watchLater, setWatchLater] = useState<string[]>([]);
  const [history, setHistory] = useState<PlaybackHistoryItem[]>([]);
  const [customChannels, setCustomChannels] = useState<Channel[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistSource[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string>('default');
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // --- UI & Player States ---
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFavoritesOnly, setIsFavoritesOnly] = useState<boolean>(false);

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const loadedFavs = getStoredFavorites();
    const loadedWL = getStoredWatchLater();
    const loadedHist = getStoredHistory();
    const loadedCustom = getStoredCustomChannels();
    const loadedPlaylists = getStoredPlaylists();
    const loadedActiveId = getStoredActivePlaylistId();
    const loadedSettings = getStoredSettings();

    setFavorites(loadedFavs);
    setWatchLater(loadedWL);
    setHistory(loadedHist);
    setCustomChannels(loadedCustom);
    setPlaylists(loadedPlaylists);
    setActivePlaylistId(loadedActiveId);
    setSettings(loadedSettings);

    // Initial selected channel (use last watched if available, else first default)
    const all = [...loadedCustom, ...DEFAULT_CHANNELS];
    if (loadedHist.length > 0 && loadedSettings.resumePlayback) {
      const lastWatchedId = loadedHist[0].channelId;
      const found = all.find((c) => c.id === lastWatchedId);
      setCurrentChannel(found || all[0]);
    } else if (all.length > 0) {
      setCurrentChannel(all[0]);
    }
  }, []);

  // Filter channels based on active playlist
  const activePlaylistChannels = useMemo(() => {
    if (activePlaylistId === 'all') {
      return [...customChannels, ...DEFAULT_CHANNELS];
    }
    if (activePlaylistId === 'default') {
      return DEFAULT_CHANNELS;
    }
    const matching = customChannels.filter((c) => c.sourcePlaylist === activePlaylistId);
    return matching.length > 0 ? matching : [...customChannels, ...DEFAULT_CHANNELS];
  }, [activePlaylistId, customChannels]);

  // Combined Channels (Custom + Default)
  const allChannels = activePlaylistChannels;

  // Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allChannels.length };
    allChannels.forEach((ch) => {
      counts[ch.category] = (counts[ch.category] || 0) + 1;
      if (ch.isCustom) {
        counts.custom = (counts.custom || 0) + 1;
      }
    });
    return counts;
  }, [allChannels]);

  // Filtered Channels
  const filteredChannels = useMemo(() => {
    return allChannels.filter((ch) => {
      // Favorites filter
      if (isFavoritesOnly && !favorites.includes(ch.id)) {
        return false;
      }

      // Category filter
      if (selectedCategory === 'favorites') {
        if (!favorites.includes(ch.id)) return false;
      } else if (selectedCategory === 'watch_later') {
        if (!watchLater.includes(ch.id)) return false;
      } else if (selectedCategory === 'custom') {
        if (!ch.isCustom) return false;
      } else if (selectedCategory !== 'all') {
        if (ch.category !== selectedCategory) return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchTitle = ch.name.toLowerCase().includes(query);
        const matchGroup = ch.groupTitle?.toLowerCase().includes(query);
        const matchId = ch.id.toLowerCase().includes(query);
        const matchCat = ch.category.toLowerCase().includes(query);
        return matchTitle || matchGroup || matchId || matchCat;
      }

      return true;
    });
  }, [allChannels, selectedCategory, searchQuery, isFavoritesOnly, favorites, watchLater]);

  // Select Channel and record history
  const handleSelectChannel = useCallback(
    (channel: Channel) => {
      setCurrentChannel(channel);
      const updatedHistory = addToStoredHistory(channel);
      setHistory(updatedHistory);
    },
    []
  );

  // Toggle Favorite
  const handleToggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const next = prev.includes(id) ? prev.filter((item) => item !== id) : [id, ...prev];
        saveFavorites(next);
        return next;
      });
    },
    []
  );

  // Toggle Watch Later
  const handleToggleWatchLater = useCallback(
    (id: string) => {
      setWatchLater((prev) => {
        const next = prev.includes(id) ? prev.filter((item) => item !== id) : [id, ...prev];
        saveWatchLater(next);
        return next;
      });
    },
    []
  );

  // Switch to Next Channel
  const handleNextChannel = useCallback(() => {
    if (!currentChannel || filteredChannels.length === 0) return;
    const currentIndex = filteredChannels.findIndex((c) => c.id === currentChannel.id);
    const nextIndex = (currentIndex + 1) % filteredChannels.length;
    handleSelectChannel(filteredChannels[nextIndex]);
  }, [currentChannel, filteredChannels, handleSelectChannel]);

  // Switch to Previous Channel
  const handlePrevChannel = useCallback(() => {
    if (!currentChannel || filteredChannels.length === 0) return;
    const currentIndex = filteredChannels.findIndex((c) => c.id === currentChannel.id);
    const prevIndex = (currentIndex - 1 + filteredChannels.length) % filteredChannels.length;
    handleSelectChannel(filteredChannels[prevIndex]);
  }, [currentChannel, filteredChannels, handleSelectChannel]);

  // Add / Save Playlist
  const handleAddPlaylist = (playlist: PlaylistSource, newChannels: Channel[]) => {
    const updatedPlaylists = [playlist, ...playlists.filter((p) => p.id !== playlist.id)];
    setPlaylists(updatedPlaylists);
    savePlaylists(updatedPlaylists);

    // Stamp new channels with sourcePlaylist ID
    const stampedChannels = newChannels.map((ch) => ({
      ...ch,
      sourcePlaylist: playlist.id,
      isCustom: true,
    }));

    const otherChannels = customChannels.filter((ch) => ch.sourcePlaylist !== playlist.id);
    const mergedChannels = [...stampedChannels, ...otherChannels];
    setCustomChannels(mergedChannels);
    saveCustomChannels(mergedChannels);

    setActivePlaylistId(playlist.id);
    saveStoredActivePlaylistId(playlist.id);

    if (stampedChannels.length > 0) {
      handleSelectChannel(stampedChannels[0]);
    }
  };

  // Switch Active Playlist
  const handleSelectPlaylist = (playlistId: string) => {
    setActivePlaylistId(playlistId);
    saveStoredActivePlaylistId(playlistId);

    if (playlistId === 'default') {
      if (DEFAULT_CHANNELS.length > 0) handleSelectChannel(DEFAULT_CHANNELS[0]);
    } else {
      const match = customChannels.filter((c) => c.sourcePlaylist === playlistId);
      if (match.length > 0) {
        handleSelectChannel(match[0]);
      } else if (DEFAULT_CHANNELS.length > 0) {
        handleSelectChannel(DEFAULT_CHANNELS[0]);
      }
    }
  };

  // Delete Playlist
  const handleDeletePlaylist = (playlistId: string) => {
    const updatedPlaylists = playlists.filter((p) => p.id !== playlistId);
    setPlaylists(updatedPlaylists);
    savePlaylists(updatedPlaylists);

    const remainingChannels = customChannels.filter((c) => c.sourcePlaylist !== playlistId);
    setCustomChannels(remainingChannels);
    saveCustomChannels(remainingChannels);

    if (activePlaylistId === playlistId) {
      setActivePlaylistId('default');
      saveStoredActivePlaylistId('default');
      if (DEFAULT_CHANNELS.length > 0) handleSelectChannel(DEFAULT_CHANNELS[0]);
    }
  };

  // Import Channels callback
  const handleImportChannels = (
    newChannels: Channel[],
    replaceExisting: boolean,
    playlistName: string
  ) => {
    const playlistId = `imported_${Date.now()}`;
    const newPlaylist: PlaylistSource = {
      id: playlistId,
      name: playlistName || 'Imported Playlist',
      type: 'm3u_url',
      channelCount: newChannels.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    };
    handleAddPlaylist(newPlaylist, newChannels);
  };

  // Save Settings
  const handleSaveSettings = (newSettings: Partial<UserSettings>) => {
    const updated = saveStoredSettings(newSettings);
    setSettings(updated);
  };

  // Clear History
  const handleClearHistory = () => {
    clearStoredHistory();
    setHistory([]);
  };

  // Reset Defaults
  const handleResetDefaults = () => {
    saveCustomChannels([]);
    savePlaylists([]);
    saveStoredActivePlaylistId('default');
    saveFavorites([]);
    saveWatchLater([]);
    clearStoredHistory();
    saveStoredSettings(DEFAULT_SETTINGS);

    setCustomChannels([]);
    setPlaylists([]);
    setActivePlaylistId('default');
    setFavorites([]);
    setWatchLater([]);
    setHistory([]);
    setSettings(DEFAULT_SETTINGS);
    setCurrentChannel(DEFAULT_CHANNELS[0] || null);
  };

  // Active playlist name for UI
  const currentActivePlaylistObj = playlists.find((p) => p.id === activePlaylistId);
  const activePlaylistDisplayName =
    activePlaylistId === 'default'
      ? 'SiamIPTV (Free Streams)'
      : activePlaylistId === 'all'
      ? 'รวมทุกเพลย์ลิสต์ (All Channels)'
      : currentActivePlaylistObj?.name || 'My Playlist';

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        favoriteCount={favorites.length}
        historyCount={history.length}
        isFavoritesOnly={isFavoritesOnly}
        onToggleFavoritesOnly={() => setIsFavoritesOnly(!isFavoritesOnly)}
        settings={settings}
        onToggleTVMode={() =>
          handleSaveSettings({ smartTVMode: !settings.smartTVMode })
        }
        channelCount={allChannels.length}
      />

      {/* Playlist Source Selector Bar */}
      <div className="border-b border-white/5 bg-[#080808]/90 py-2 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              เพลย์ลิสต์:
            </span>

            {/* Default SiamIPTV button */}
            <button
              type="button"
              onClick={() => handleSelectPlaylist('default')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activePlaylistId === 'default'
                  ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Tv className="w-3 h-3" />
              <span>SiamIPTV (ค่าเริ่มต้น)</span>
            </button>

            {/* User Added Playlists */}
            {playlists.map((pl) => {
              const isActive = activePlaylistId === pl.id;
              let icon = <FileText className="w-3 h-3" />;
              let badgeColor = 'text-blue-300';

              if (pl.type === 'xtream') {
                icon = <Server className="w-3 h-3 text-orange-400" />;
                badgeColor = 'text-orange-300';
              } else if (pl.type === 'w3u') {
                icon = <Radio className="w-3 h-3 text-emerald-400" />;
                badgeColor = 'text-emerald-300';
              }

              return (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => handleSelectPlaylist(pl.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)] font-bold'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {icon}
                  <span className="truncate max-w-[140px]">{pl.name}</span>
                  <span className={`text-[10px] font-mono px-1 rounded bg-black/40 ${badgeColor}`}>
                    {pl.channelCount}
                  </span>
                </button>
              );
            })}

            {/* All Playlists combined option if user has custom playlists */}
            {playlists.length > 0 && (
              <button
                type="button"
                onClick={() => handleSelectPlaylist('all')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activePlaylistId === 'all'
                    ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <span>รวมทุกช่อง</span>
              </button>
            )}
          </div>

          {/* Quick Add Playlist Button */}
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ เพิ่ม Xtream / W3U / M3U</span>
          </button>
        </div>
      </div>

      {/* Horizontal Category Navigation */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (isFavoritesOnly) setIsFavoritesOnly(false);
        }}
        categoryCounts={categoryCounts}
        favoritesCount={favorites.length}
        watchLaterCount={watchLater.length}
      />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-6">
        {/* Active Player Section */}
        <section className="w-full flex flex-col gap-3">
          <VideoPlayer
            channel={currentChannel}
            settings={settings}
            isFavorite={currentChannel ? favorites.includes(currentChannel.id) : false}
            isWatchLater={currentChannel ? watchLater.includes(currentChannel.id) : false}
            onToggleFavorite={handleToggleFavorite}
            onToggleWatchLater={handleToggleWatchLater}
            onNextChannel={handleNextChannel}
            onPrevChannel={handlePrevChannel}
            onUpdateHistoryProgress={(ch, pos, dur) => {
              addToStoredHistory(ch, pos, dur);
            }}
          />

          {/* Current Channel Info Bar & Quick Switcher Carousel */}
          <ChannelInfoBar
            currentChannel={currentChannel}
            channels={filteredChannels}
            favorites={favorites}
            watchLater={watchLater}
            onSelectChannel={handleSelectChannel}
            onToggleFavorite={handleToggleFavorite}
            onToggleWatchLater={handleToggleWatchLater}
          />
        </section>

        {/* Channel Grid Section */}
        <section className="w-full flex flex-col gap-3.5">
          {/* Section Header with Active Filter and Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Tv className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Channel Directory ({filteredChannels.length})
              </h3>
              {searchQuery && (
                <span className="text-xs text-white/50">
                  Search results for: &quot;<span className="text-blue-400 font-medium">{searchQuery}</span>&quot;
                </span>
              )}
            </div>

            {/* Quick Filter Reset */}
            {(searchQuery || selectedCategory !== 'all' || isFavoritesOnly) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setIsFavoritesOnly(false);
                }}
                className="text-xs text-white/50 hover:text-white transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Channels Grid */}
          {filteredChannels.length > 0 ? (
            <div
              className={`grid gap-3.5 sm:gap-4 ${
                settings.smartTVMode
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
              }`}
            >
              {filteredChannels.map((ch) => (
                <ChannelCard
                  key={ch.id}
                  channel={ch}
                  isActive={currentChannel?.id === ch.id}
                  isFavorite={favorites.includes(ch.id)}
                  isWatchLater={watchLater.includes(ch.id)}
                  onSelect={handleSelectChannel}
                  onToggleFavorite={(id, e) => {
                    e.stopPropagation();
                    handleToggleFavorite(id);
                  }}
                  onToggleWatchLater={(id, e) => {
                    e.stopPropagation();
                    handleToggleWatchLater(id);
                  }}
                  smartTVMode={settings.smartTVMode}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0a0a0a] p-12 text-center shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-blue-400 mb-3 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold text-white">
                No matching channels found
              </h4>
              <p className="mt-1 max-w-sm text-xs text-white/50">
                Try searching with another keyword or select another category from the filters above.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setIsFavoritesOnly(false);
                }}
                className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              >
                View all channels ({allChannels.length})
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-[#050505] py-5 px-4 text-center text-xs text-white/40">
        <p>
          IPTV Player • High-performance M3U, HLS & DVR stream player with local state persistence
        </p>
      </footer>

      {/* Dialog Modals & Drawers */}
      <M3UImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        playlists={playlists}
        activePlaylistId={activePlaylistId}
        onSelectPlaylist={handleSelectPlaylist}
        onAddPlaylist={handleAddPlaylist}
        onDeletePlaylist={handleDeletePlaylist}
        onImportChannels={handleImportChannels}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onClearHistory={handleClearHistory}
        onResetDefaults={handleResetDefaults}
      />

      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={history}
        watchLaterIds={watchLater}
        allChannels={allChannels}
        onSelectChannel={handleSelectChannel}
        onClearHistory={handleClearHistory}
        onRemoveWatchLater={handleToggleWatchLater}
      />
    </div>
  );
}
