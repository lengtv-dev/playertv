import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture,
  RotateCcw,
  SkipBack,
  SkipForward,
  Star,
  Bookmark,
  Activity,
  Ratio,
  AlertCircle,
  Loader2,
  Tv,
  Radio,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { Channel, UserSettings, StreamStats } from '../types';
import { resolveStreamUrl } from '../services/streamProxy';

interface VideoPlayerProps {
  channel: Channel | null;
  settings: UserSettings;
  isFavorite: boolean;
  isWatchLater: boolean;
  onToggleFavorite: (id: string) => void;
  onToggleWatchLater: (id: string) => void;
  onNextChannel?: () => void;
  onPrevChannel?: () => void;
  onUpdateHistoryProgress?: (channel: Channel, pos: number, dur: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  settings,
  isFavorite,
  isWatchLater,
  onToggleFavorite,
  onToggleWatchLater,
  onNextChannel,
  onPrevChannel,
  onUpdateHistoryProgress,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(settings.isMuted);
  const [volume, setVolume] = useState<number>(settings.volume);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<string>(settings.aspectRatio || '16:9');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [forcedProxy, setForcedProxy] = useState<boolean>(false);

  // Playback timeline
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLiveStream, setIsLiveStream] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [streamStats, setStreamStats] = useState<StreamStats>({});

  const controlsTimeoutRef = useRef<number | null>(null);

  // Auto-hide controls logic
  const triggerShowControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  }, [isPlaying]);

  // Load and play stream
  useEffect(() => {
    if (!channel) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    const video = videoRef.current;
    if (!video) return;

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const resolvedUrl = resolveStreamUrl(channel.url, settings, forcedProxy);

    const handleHlsPlay = () => {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: settings.lowLatency,
          backBufferLength: 90,
          manifestLoadingTimeOut: 15000,
          manifestLoadingMaxRetry: 3,
          levelLoadingTimeOut: 15000,
          levelLoadingMaxRetry: 3,
          fragLoadingTimeOut: 20000,
          fragLoadingMaxRetry: 4,
        });

        hlsRef.current = hls;
        hls.loadSource(resolvedUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          setIsLoading(false);
          setIsLiveStream(data.levels[0]?.details?.live ?? true);
          if (settings.autoPlay) {
            video.play().catch(() => {
              // Auto-play was prevented by browser policy, user interaction will trigger it
              setIsPlaying(false);
            });
          }
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          const level = hls.levels[data.level];
          if (level) {
            setStreamStats((prev) => ({
              ...prev,
              resolution: `${level.width}x${level.height}`,
              bitrate: Math.round(level.bitrate / 1000),
            }));
          }
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          console.warn('HLS Error encountered:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // Network error: try failover to proxy if not already using it
                if (!forcedProxy && settings.proxyMode !== 'direct') {
                  console.log('Stream network error: Failing over to proxy route...');
                  setForcedProxy(true);
                  hls.destroy();
                  return;
                }
                setErrorMsg('ไม่สามารถเชื่อมต่อสัญญาณสตรีมได้ (กรุณาตรวจสอบเครือข่ายหรือเปลี่ยนช่อง)');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                setErrorMsg('เกิดข้อผิดพลาดในการถอดรหัสวิดีโอ (Codec error)');
                break;
            }
            setIsLoading(false);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native Safari HLS
        video.src = resolvedUrl;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          if (settings.autoPlay) video.play().catch(() => {});
        });
      } else {
        // Standard video file
        video.src = resolvedUrl;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          if (settings.autoPlay) video.play().catch(() => {});
        });
      }
    };

    handleHlsPlay();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel, retryCount, forcedProxy, settings.proxyMode, settings.workerUrl]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);

      // Collect diagnostic stats
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferLength = Math.max(0, bufferedEnd - video.currentTime);
        setStreamStats((prev) => ({
          ...prev,
          buffered: Math.round(bufferLength * 10) / 10,
          resolution: prev.resolution || `${video.videoWidth}x${video.videoHeight}`,
        }));
      }

      // Periodically update playback history
      if (channel && Math.floor(video.currentTime) % 15 === 0 && onUpdateHistoryProgress) {
        onUpdateHistoryProgress(channel, video.currentTime, video.duration || 0);
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [channel, onUpdateHistoryProgress]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard navigation for playback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekRelative(10);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekRelative(-10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(-0.1);
          break;
        case 'KeyZ':
          e.preventDefault();
          onPrevChannel?.();
          break;
        case 'KeyX':
          e.preventDefault();
          onNextChannel?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
    triggerShowControls();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    triggerShowControls();
  };

  const handleVolumeChange = (newVal: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVal;
    setVolume(newVal);
    if (newVal > 0 && video.muted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const changeVolume = (delta: number) => {
    const newVol = Math.max(0, Math.min(1, volume + delta));
    handleVolumeChange(newVol);
    triggerShowControls();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP not supported or failed', e);
    }
  };

  const seekRelative = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(duration || 999999, video.currentTime + seconds));
    triggerShowControls();
  };

  const replayFromBeginning = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {});
    triggerShowControls();
  };

  const reloadStream = () => {
    setIsLoading(true);
    setErrorMsg(null);
    setRetryCount((prev) => prev + 1);
  };

  const cycleAspectRatio = () => {
    const modes = ['16:9', '4:3', 'fill', 'original'];
    const next = modes[(modes.indexOf(aspectRatio) + 1) % modes.length];
    setAspectRatio(next);
    triggerShowControls();
  };

  // Video object-fit style
  const getObjectFitStyle = () => {
    switch (aspectRatio) {
      case 'fill':
        return 'object-cover';
      case '4:3':
        return 'object-contain scale-x-75';
      case 'original':
        return 'object-none';
      default:
        return 'object-contain';
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!channel) {
    return (
      <div className="relative aspect-video w-full rounded-2xl border border-white/10 bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.12),transparent_70%)]" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.25)]">
          <Tv className="h-8 w-8" />
        </div>
        <h3 className="relative text-base sm:text-lg font-semibold text-white tracking-tight">
          Select a channel to start streaming
        </h3>
        <p className="relative mt-1 max-w-sm text-xs text-white/50">
          Click any channel from the grid or categories below, or search by name or category.
        </p>
      </div>
    );
  }

  const isProxyActive = forcedProxy || settings.proxyMode === 'builtin' || (settings.proxyMode === 'auto' && channel.url.includes('ball-online.com'));

  return (
    <div
      ref={containerRef}
      onMouseMove={triggerShowControls}
      onClick={triggerShowControls}
      className={`relative w-full overflow-hidden bg-black select-none group shadow-2xl transition-all ${
        isFullscreen ? 'h-screen w-screen' : 'aspect-video rounded-2xl border border-white/10'
      }`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        className={`h-full w-full bg-black cursor-pointer ${getObjectFitStyle()}`}
        onClick={togglePlay}
      />

      {/* Immersive UI Radial Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.12),transparent_70%)]" />

      {/* Big Play Button when Paused */}
      {!isPlaying && !isLoading && !errorMsg && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            type="button"
            onClick={togglePlay}
            className="pointer-events-auto w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-[0_0_25px_rgba(37,99,235,0.4)]"
            title="Play"
          >
            <Play className="w-8 h-8 ml-1 text-white fill-white" />
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs transition-opacity">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="mt-3 text-xs font-medium text-white/80 tracking-wide">
            กำลังโหลดสัญญาณ {channel.name}...
          </p>
          {isProxyActive && (
            <span className="mt-1 flex items-center gap-1 text-[11px] text-blue-400">
              <ShieldCheck className="h-3 w-3" /> ผ่านระบบสตรีมบายพาส Proxy
            </span>
          )}
        </div>
      )}

      {/* Error Fallback Box */}
      {errorMsg && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/95 p-6 text-center border border-white/10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-3 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h4 className="text-sm sm:text-base font-semibold text-white">
            สัญญาณสตรีมขัดข้องชั่วคราว
          </h4>
          <p className="mt-1 max-w-md text-xs text-white/50">{errorMsg}</p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={reloadStream}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              ลองใหม่อีกครั้ง
            </button>

            <button
              type="button"
              onClick={() => {
                setForcedProxy(!forcedProxy);
                reloadStream();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10 transition-colors"
            >
              {forcedProxy ? 'สลับเป็นเชื่อมต่อตรง (Direct)' : 'เปิดใช้ระบบบายพาส (Proxy Mode)'}
            </button>

            {onNextChannel && (
              <button
                type="button"
                onClick={onNextChannel}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10"
              >
                ช่องถัดไป
                <SkipForward className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Overlay Banner (Channel Info & Tags) */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-300 flex items-center justify-between ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={channel.logo}
            alt={channel.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                channel.name
              )}&background=0a0a0a&color=ffffff`;
            }}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-contain bg-black/80 border border-white/10 p-1 shrink-0 shadow-lg"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight truncate drop-shadow-md">
                {channel.name}
              </h2>
              {channel.resolution ? (
                <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase text-white shadow-[0_0_10px_rgba(37,99,235,0.4)] font-mono">
                  {channel.resolution}
                </span>
              ) : (
                <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase text-white shadow-[0_0_10px_rgba(37,99,235,0.4)] font-mono">
                  Full HD
                </span>
              )}
              {isLiveStream ? (
                <div className="flex items-center gap-1.5 bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-full border border-red-500/20">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold tracking-tight">LIVE</span>
                </div>
              ) : (
                <span className="rounded bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                  DVR / Catch-up
                </span>
              )}
            </div>
            <p className="text-xs text-white/60 truncate drop-shadow mt-0.5">
              Now Playing: <span className="text-white/90">{channel.currentProgram || channel.name}</span>
            </p>
          </div>
        </div>

        {/* Top Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(channel.id);
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border backdrop-blur-md transition-all ${
              isFavorite
                ? 'border-blue-500 bg-blue-600/20 text-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
            title="บันทึกรายการโปรด"
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-blue-400' : ''}`} />
          </button>

          {/* Watch Later Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchLater(channel.id);
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border backdrop-blur-md transition-all ${
              isWatchLater
                ? 'border-sky-500 bg-sky-500/20 text-sky-400'
                : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
            title="บันทึกไว้ดูภายหลัง"
          >
            <Bookmark className={`h-4 w-4 ${isWatchLater ? 'fill-sky-400' : ''}`} />
          </button>

          {/* Diagnostics HUD Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDiagnostics(!showDiagnostics);
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border backdrop-blur-md transition-all ${
              showDiagnostics
                ? 'border-blue-500 bg-blue-600/20 text-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
            title="ข้อมูลสัญญาณสตรีม (Diagnostics)"
          >
            <Activity className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stream Diagnostics Overlay */}
      {showDiagnostics && (
        <div className="absolute top-16 right-3 sm:right-4 z-20 w-64 rounded-xl border border-zinc-800 bg-zinc-950/90 p-3 text-[11px] backdrop-blur-md font-mono text-zinc-300 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
            <span className="font-semibold text-amber-400 flex items-center gap-1">
              <Activity className="h-3 w-3" /> ข้อมูลสัญญาณสตรีม
            </span>
            <span className="text-[10px] text-zinc-500">{channel.id}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-500">ความละเอียด:</span>
              <span className="font-semibold text-white">{streamStats.resolution || 'อัตโนมัติ'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">บิตเรต:</span>
              <span>{streamStats.bitrate ? `${streamStats.bitrate} kbps` : 'ผันแปร (VBR)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Buffer ล่วงหน้า:</span>
              <span className="text-emerald-400">{streamStats.buffered ? `${streamStats.buffered}s` : 'กำลังคำนวณ'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">สถานะ Proxy:</span>
              <span className={isProxyActive ? 'text-blue-400' : 'text-zinc-400'}>
                {isProxyActive ? 'ผ่าน Proxy Bypass' : 'เชื่อมต่อตรง (Direct)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">การจัดสัดส่วน:</span>
              <span>{aspectRatio}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/50 to-transparent transition-opacity duration-300 flex flex-col gap-3 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Seekbar / Catch-up Replay Timeline for VOD or DVR */}
        <div className="flex items-center gap-3">
          {duration > 0 ? (
            <>
              <span className="text-[11px] font-mono text-white/60 w-12 text-right">
                {formatTime(currentTime)}
              </span>
              <div className="relative flex-1 group/bar py-1 cursor-pointer">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => {
                    const video = videoRef.current;
                    if (!video) return;
                    video.currentTime = parseFloat(e.target.value);
                  }}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500 hover:h-2 transition-all"
                />
              </div>
              <span className="text-[11px] font-mono text-white/40 w-12">
                {formatTime(duration)}
              </span>
            </>
          ) : (
            <div className="w-full flex items-center justify-between text-[11px] text-white/60 px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-white/80 font-medium">Live Broadcast Stream</span>
              </div>
              <button
                type="button"
                onClick={replayFromBeginning}
                className="flex items-center gap-1.5 text-[11px] text-white/60 hover:text-white transition-colors"
                title="เริ่มเล่นใหม่ตั้งแต่ต้น"
              >
                <RotateCcw className="h-3 w-3" /> Replay
              </button>
            </div>
          )}
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left Group: Play/Pause, Channel Skip, Replay */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              title={isPlaying ? 'หยุดชั่วคราว (Space)' : 'เล่น (Space)'}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
            </button>

            {/* Quick 10s Replay / Seek back */}
            <button
              type="button"
              onClick={() => seekRelative(-10)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              title="ย้อนหลัง 10 วินาที"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            {/* Quick 10s Forward */}
            <button
              type="button"
              onClick={() => seekRelative(10)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              title="เดินหน้า 10 วินาที"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            {/* Channel Switchers */}
            <div className="hidden sm:flex items-center border-l border-white/10 pl-3 ml-1 gap-1.5">
              <button
                type="button"
                onClick={onPrevChannel}
                disabled={!onPrevChannel}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30"
                title="ช่องก่อนหน้า (Z)"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={onNextChannel}
                disabled={!onNextChannel}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30"
                title="ช่องถัดไป (X)"
              >
                Next
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 ml-2">
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                title={isMuted ? 'เปิดเสียง (M)' : 'ปิดเสียง (M)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-red-400" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 sm:w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Right Group: Aspect Ratio, Reload, PiP, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Aspect Ratio Button */}
            <button
              type="button"
              onClick={cycleAspectRatio}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5"
              title="เปลี่ยนอัตราส่วนภาพ (16:9, 4:3, Fill, Original)"
            >
              <Ratio className="h-4 w-4" />
              <span className="hidden sm:inline">{aspectRatio}</span>
            </button>

            {/* Reload Stream Button */}
            <button
              type="button"
              onClick={reloadStream}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              title="รีเฟรชสัญญาณสตรีม"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Picture-in-Picture Button */}
            <button
              type="button"
              onClick={togglePiP}
              className="hidden sm:flex p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              title="ย่อหน้าจอเล่นลอย (Picture-in-Picture)"
            >
              <PictureInPicture className="h-4 w-4" />
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              title="เต็มหน้าจอ (F)"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
