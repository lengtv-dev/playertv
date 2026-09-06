import React, { useState } from 'react';
import {
  X,
  History,
  Bookmark,
  Play,
  Trash2,
  Clock,
} from 'lucide-react';
import { PlaybackHistoryItem, Channel } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: PlaybackHistoryItem[];
  watchLaterIds: string[];
  allChannels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  onClearHistory: () => void;
  onRemoveWatchLater: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  watchLaterIds,
  allChannels,
  onSelectChannel,
  onClearHistory,
  onRemoveWatchLater,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'watch_later'>('history');

  if (!isOpen) return null;

  const watchLaterChannels = allChannels.filter((ch) => watchLaterIds.includes(ch.id));

  const formatTimestamp = (ts: number) => {
    const diffMs = Date.now() - ts;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'เมื่อสักครู่';
    if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    return `${diffDays} วันที่แล้ว`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="relative h-full w-full max-w-md border-l border-white/10 bg-[#0a0a0a] p-6 shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <History className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Playback & History
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="mt-4 flex border-b border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex flex-1 items-center justify-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-white/40 hover:text-white/80'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Recently Watched ({history.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('watch_later')}
            className={`flex flex-1 items-center justify-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'watch_later'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-white/40 hover:text-white/80'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            Watch Later ({watchLaterChannels.length})
          </button>
        </div>

        {/* List Content */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {activeTab === 'history' && (
            <>
              {history.length === 0 ? (
                <div className="py-16 text-center text-white/40 text-xs">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-30 text-blue-400" />
                  No playback history yet
                </div>
              ) : (
                history.map((item, index) => {
                  const matchedChannel = allChannels.find((c) => c.id === item.channelId) || {
                    id: item.channelId,
                    name: item.channelName,
                    url: item.channelUrl,
                    logo: item.channelLogo,
                    category: item.category,
                  };

                  return (
                    <div
                      key={`${item.channelId}_${index}`}
                      onClick={() => {
                        onSelectChannel(matchedChannel as Channel);
                        onClose();
                      }}
                      className="group flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.06] hover:shadow-[0_0_15px_rgba(37,99,235,0.15)] cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.channelLogo}
                          alt={item.channelName}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              item.channelName
                            )}&background=0a0a0a&color=ffffff`;
                          }}
                          className="h-10 w-10 rounded-xl object-contain bg-black p-1 border border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                            {item.channelName}
                          </h4>
                          <span className="text-[10px] text-white/40 flex items-center gap-1 mt-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            {formatTimestamp(item.watchedAt)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                        title="เล่นช่องนี้"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                      </button>
                    </div>
                  );
                })
              )}
            </>
          )}

          {activeTab === 'watch_later' && (
            <>
              {watchLaterChannels.length === 0 ? (
                <div className="py-16 text-center text-white/40 text-xs">
                  <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-30 text-sky-400" />
                  No channels saved for later
                </div>
              ) : (
                watchLaterChannels.map((channel) => (
                  <div
                    key={channel.id}
                    className="group flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.06] hover:shadow-[0_0_15px_rgba(37,99,235,0.15)] transition-all"
                  >
                    <div
                      onClick={() => {
                        onSelectChannel(channel);
                        onClose();
                      }}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            channel.name
                          )}&background=0a0a0a&color=ffffff`;
                        }}
                        className="h-10 w-10 rounded-xl object-contain bg-black p-1 border border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate group-hover:text-sky-400 transition-colors">
                          {channel.name}
                        </h4>
                        <p className="text-[10px] text-white/40 truncate mt-0.5">
                          {channel.groupTitle || 'Saved Channel'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectChannel(channel);
                          onClose();
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 hover:bg-sky-500 hover:text-white transition-colors"
                        title="เริ่มเล่น"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveWatchLater(channel.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors"
                        title="ลบออกจากรายการ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'history' && history.length > 0 && (
          <div className="border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClearHistory}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-medium text-white/60 hover:text-red-400 hover:border-red-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Playback History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
