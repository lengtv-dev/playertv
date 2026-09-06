import { Channel, PlaybackHistoryItem, UserSettings, PlaylistSource } from '../types';

const STORAGE_KEYS = {
  FAVORITES: 'siam_iptv_favorites',
  WATCH_LATER: 'siam_iptv_watch_later',
  HISTORY: 'siam_iptv_history',
  CUSTOM_CHANNELS: 'siam_iptv_custom_channels',
  PLAYLISTS: 'siam_iptv_playlists_v2',
  ACTIVE_PLAYLIST: 'siam_iptv_active_playlist',
  SETTINGS: 'siam_iptv_settings',
};

export const DEFAULT_SETTINGS: UserSettings = {
  proxyMode: 'auto',
  workerUrl: '',
  volume: 0.9,
  isMuted: false,
  aspectRatio: '16:9',
  autoPlay: true,
  lowLatency: true,
  theaterMode: false,
  smartTVMode: false,
  preferredQuality: 'auto',
  resumePlayback: true,
};

// --- Favorites ---
export function getStoredFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save favorites to localStorage', e);
  }
}

export function toggleFavoriteInStorage(id: string): string[] {
  const current = getStoredFavorites();
  const exists = current.includes(id);
  const updated = exists ? current.filter((item) => item !== id) : [id, ...current];
  saveFavorites(updated);
  return updated;
}

// --- Watch Later ---
export function getStoredWatchLater(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATCH_LATER);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWatchLater(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WATCH_LATER, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save watch later to localStorage', e);
  }
}

export function toggleWatchLaterInStorage(id: string): string[] {
  const current = getStoredWatchLater();
  const exists = current.includes(id);
  const updated = exists ? current.filter((item) => item !== id) : [id, ...current];
  saveWatchLater(updated);
  return updated;
}

// --- Playback History ---
export function getStoredHistory(): PlaybackHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToStoredHistory(
  channel: Channel,
  lastPositionSeconds?: number,
  durationSeconds?: number
): PlaybackHistoryItem[] {
  try {
    const current = getStoredHistory().filter((item) => item.channelId !== channel.id);
    const newItem: PlaybackHistoryItem = {
      channelId: channel.id,
      channelName: channel.name,
      channelLogo: channel.logo,
      channelUrl: channel.url,
      category: channel.category,
      watchedAt: Date.now(),
      lastPositionSeconds: lastPositionSeconds || 0,
      durationSeconds: durationSeconds || 0,
    };
    // Keep max 50 items
    const updated = [newItem, ...current].slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to update history', e);
    return [];
  }
}

export function clearStoredHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}

// --- Custom Channels & Playlists ---
export function getStoredCustomChannels(): Channel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_CHANNELS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomChannels(channels: Channel[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CHANNELS, JSON.stringify(channels));
  } catch (e) {
    console.error('Failed to save custom channels', e);
  }
}

export function getStoredPlaylists(): PlaylistSource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePlaylists(playlists: PlaylistSource[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  } catch (e) {
    console.error('Failed to save playlists', e);
  }
}

export function getStoredActivePlaylistId(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAYLIST) || 'default';
  } catch {
    return 'default';
  }
}

export function saveStoredActivePlaylistId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAYLIST, id);
  } catch (e) {
    console.error('Failed to save active playlist id', e);
  }
}

// --- User Settings ---
export function getStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: Partial<UserSettings>): UserSettings {
  try {
    const current = getStoredSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save settings', e);
    return DEFAULT_SETTINGS;
  }
}

// --- Export / Import Backup ---
export function exportAllUserData(): string {
  const exportData = {
    app: 'SiamIPTV Player',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    favorites: getStoredFavorites(),
    watchLater: getStoredWatchLater(),
    history: getStoredHistory(),
    customChannels: getStoredCustomChannels(),
    playlists: getStoredPlaylists(),
    activePlaylistId: getStoredActivePlaylistId(),
    settings: getStoredSettings(),
  };
  return JSON.stringify(exportData, null, 2);
}

export function importAllUserData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.favorites) saveFavorites(data.favorites);
    if (data.watchLater) saveWatchLater(data.watchLater);
    if (data.history) localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
    if (data.customChannels) saveCustomChannels(data.customChannels);
    if (data.playlists) savePlaylists(data.playlists);
    if (data.activePlaylistId) saveStoredActivePlaylistId(data.activePlaylistId);
    if (data.settings) saveStoredSettings(data.settings);
    return true;
  } catch (err) {
    console.error('Error importing backup data', err);
    return false;
  }
}
