export type CategoryKey =
  | 'all'
  | 'favorites'
  | 'history'
  | 'watch_later'
  | 'sports'
  | 'thaidigtv'
  | 'movies'
  | 'anime'
  | 'documentary'
  | 'news'
  | 'variety'
  | 'custom';

export interface Channel {
  id: string;
  name: string;
  url: string;
  backupUrl?: string; // e.g. url1 in Wiseplay w3u
  logo: string;
  category: CategoryKey;
  groupTitle?: string;
  tvgId?: string;
  resolution?: string; // 'Full HD' | 'HD' | '4K' | 'SD'
  isLive?: boolean;
  isCustom?: boolean;
  sourcePlaylist?: string;
  sourceType?: 'm3u' | 'w3u' | 'xtream' | 'default';
  streamId?: string | number;
  referer?: string;
  userAgent?: string;
  description?: string;
  currentProgram?: string;
  nextProgram?: string;
}

export interface XtreamConfig {
  serverUrl: string;
  username: string;
  password: string;
  outputFormat?: 'm3u8' | 'ts';
}

export interface XtreamAccountInfo {
  username?: string;
  status?: string;
  expDate?: string;
  isTrial?: boolean;
  activeCons?: string;
  maxConnections?: string;
  serverUrl?: string;
  serverProtocol?: string;
  port?: string;
  timezone?: string;
}

export interface PlaylistSource {
  id: string;
  name: string;
  type: 'm3u_url' | 'm3u_file' | 'w3u' | 'xtream' | 'default';
  url?: string;
  xtreamConfig?: XtreamConfig;
  accountInfo?: XtreamAccountInfo;
  channelCount: number;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

export interface PlaybackHistoryItem {
  channelId: string;
  channelName: string;
  channelLogo: string;
  channelUrl: string;
  category: CategoryKey;
  watchedAt: number; // timestamp ms
  lastPositionSeconds?: number;
  durationSeconds?: number;
}

export interface M3UPlaylist {
  id: string;
  name: string;
  url?: string;
  channelCount: number;
  createdAt: number;
  isActive: boolean;
}

export interface UserSettings {
  proxyMode: 'auto' | 'direct' | 'worker' | 'builtin';
  workerUrl: string; // e.g. custom Cloudflare Worker or CORS proxy
  volume: number; // 0 to 1
  isMuted: boolean;
  aspectRatio: '16:9' | '4:3' | 'fill' | 'original';
  autoPlay: boolean;
  lowLatency: boolean;
  theaterMode: boolean;
  smartTVMode: boolean;
  preferredQuality: string;
  resumePlayback: boolean;
}

export interface StreamStats {
  resolution?: string;
  bitrate?: number;
  buffered?: number;
  droppedFrames?: number;
  bandwidth?: number;
  latency?: number;
  isLive?: boolean;
}
