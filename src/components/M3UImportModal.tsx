import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Server,
  Key,
  User,
  Radio,
  Sparkles,
  RefreshCw,
  Trash2,
  Play,
  Calendar,
  ShieldCheck,
  Tv,
} from 'lucide-react';
import { Channel, PlaylistSource, XtreamConfig, XtreamAccountInfo } from '../types';
import { parseM3U, parseW3U, parseAnyPlaylist } from '../services/m3uParser';
import { testXtreamAccount, fetchXtreamLiveStreams, getXtreamM3uUrl } from '../services/xtreamService';

interface M3UImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: PlaylistSource[];
  activePlaylistId: string;
  onSelectPlaylist: (playlistId: string) => void;
  onAddPlaylist: (playlist: PlaylistSource, channels: Channel[]) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onImportChannels: (newChannels: Channel[], replaceExisting: boolean, playlistName: string) => void;
}

export const M3UImportModal: React.FC<M3UImportModalProps> = ({
  isOpen,
  onClose,
  playlists,
  activePlaylistId,
  onSelectPlaylist,
  onAddPlaylist,
  onDeletePlaylist,
  onImportChannels,
}) => {
  const [activeTab, setActiveTab] = useState<'xtream' | 'w3u' | 'm3u_url' | 'file' | 'manage'>('xtream');

  // Xtream State
  const [xtreamServer, setXtreamServer] = useState<string>('');
  const [xtreamUser, setXtreamUser] = useState<string>('');
  const [xtreamPass, setXtreamPass] = useState<string>('');
  const [xtreamFormat, setXtreamFormat] = useState<'m3u8' | 'ts'>('m3u8');
  const [xtreamPlaylistName, setXtreamPlaylistName] = useState<string>('');
  const [xtreamAccountInfo, setXtreamAccountInfo] = useState<XtreamAccountInfo | null>(null);
  const [isTestingXtream, setIsTestingXtream] = useState<boolean>(false);

  // M3U URL State
  const [m3uUrlInput, setM3uUrlInput] = useState<string>('');
  const [m3uPlaylistName, setM3uPlaylistName] = useState<string>('');

  // Wiseplay W3U State
  const [w3uUrlInput, setW3uUrlInput] = useState<string>('');
  const [w3uRawText, setW3uRawText] = useState<string>('');
  const [w3uPlaylistName, setW3uPlaylistName] = useState<string>('');
  const [w3uSubTab, setW3uSubTab] = useState<'url' | 'file' | 'raw'>('url');

  // File Upload State
  const [replaceExisting, setReplaceExisting] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Common Feedback State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewChannels, setPreviewChannels] = useState<Channel[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const w3uFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Clear errors when switching tabs
  const handleTabChange = (tab: 'xtream' | 'w3u' | 'm3u_url' | 'file' | 'manage') => {
    setActiveTab(tab);
    setErrorMsg(null);
    setSuccessMsg(null);
    setPreviewChannels([]);
    setProgressMsg('');
  };

  // ==========================================
  // XTREAM CODES HANDLERS
  // ==========================================
  const handleTestXtream = async () => {
    if (!xtreamServer.trim() || !xtreamUser.trim() || !xtreamPass.trim()) {
      setErrorMsg('กรุณากรอก Server URL, Username และ Password ให้ครบถ้วน');
      return;
    }

    setIsTestingXtream(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const config: XtreamConfig = {
      serverUrl: xtreamServer.trim(),
      username: xtreamUser.trim(),
      password: xtreamPass.trim(),
      outputFormat: xtreamFormat,
    };

    const result = await testXtreamAccount(config);
    setIsTestingXtream(false);

    if (result.success) {
      setXtreamAccountInfo(result.accountInfo);
      setSuccessMsg('เชื่อมต่อเซิร์ฟเวอร์ Xtream Codes สำเร็จ! บัญชีผู้ใช้พร้อมใช้งาน');
      if (!xtreamPlaylistName) {
        setXtreamPlaylistName(`Xtream (${result.accountInfo.serverUrl || 'Server'})`);
      }
    } else {
      setErrorMsg(result.error || 'การเชื่อมต่อ Xtream Codes ล้มเหลว');
      setXtreamAccountInfo(null);
    }
  };

  const handleConnectXtream = async () => {
    if (!xtreamServer.trim() || !xtreamUser.trim() || !xtreamPass.trim()) {
      setErrorMsg('กรุณากรอก Server URL, Username และ Password ให้ครบถ้วน');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const config: XtreamConfig = {
      serverUrl: xtreamServer.trim(),
      username: xtreamUser.trim(),
      password: xtreamPass.trim(),
      outputFormat: xtreamFormat,
    };

    try {
      const result = await fetchXtreamLiveStreams(config, (msg) => setProgressMsg(msg));

      if (result.channels.length === 0) {
        throw new Error('ไม่พบช่องรายการสดในบัญชี Xtream นี้');
      }

      const pName = xtreamPlaylistName.trim() || `Xtream (${result.accountInfo.serverUrl || 'Live TV'})`;
      const playlistId = `xtream_${Date.now()}`;

      const newPlaylist: PlaylistSource = {
        id: playlistId,
        name: pName,
        type: 'xtream',
        url: getXtreamM3uUrl(config),
        xtreamConfig: config,
        accountInfo: result.accountInfo,
        channelCount: result.channels.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true,
      };

      onAddPlaylist(newPlaylist, result.channels);
      setSuccessMsg(`นำเข้าช่องรายการจาก Xtream Codes สำเร็จ (${result.channels.length} ช่อง)`);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถโหลดช่องรายการจาก Xtream เซิร์ฟเวอร์ได้');
    } finally {
      setIsLoading(false);
      setProgressMsg('');
    }
  };

  // Load Xtream Demo Credentials
  const handleLoadDemoXtream = () => {
    setXtreamServer('http://iptv.example-server.tv:8080');
    setXtreamUser('demo_user');
    setXtreamPass('demo_pass_2026');
    setXtreamPlaylistName('Xtream Demo Server (XSTREAM)');
    setErrorMsg(null);
    setSuccessMsg('ใส่ข้อมูลตัวอย่าง Xtream Codes ให้แล้ว สามารถกดทดสอบหรือแก้ไขข้อมูลเซิร์ฟเวอร์ของคุณได้');
  };

  // ==========================================
  // M3U URL / playlist.m3u HANDLERS
  // ==========================================
  const handleFetchM3uUrl = async (customUrl?: string) => {
    const targetUrl = customUrl || m3uUrlInput.trim();
    if (!targetUrl) {
      setErrorMsg('กรุณากรอก URL ไฟล์ playlist.m3u หรือ M3U8');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setProgressMsg('กำลังดาวน์โหลดเพลย์ลิสต์ M3U...');

    try {
      const fetchUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(fetchUrl);
      if (!res.ok) {
        throw new Error(`ไม่สามารถดาวน์โหลดไฟล์จาก URL ได้ (HTTP ${res.status})`);
      }

      const content = await res.text();
      setProgressMsg('กำลังแปลงข้อมูลช่องรายการ...');

      const result = parseAnyPlaylist(content, m3uPlaylistName || 'Remote M3U');
      if (result.channels.length === 0) {
        throw new Error('ไม่พบข้อมูลช่องรายการในไฟล์ M3U ที่ดาวน์โหลด');
      }

      const pName = m3uPlaylistName.trim() || result.name || 'Remote M3U Playlist';
      const playlistId = `m3u_${Date.now()}`;

      const newPlaylist: PlaylistSource = {
        id: playlistId,
        name: pName,
        type: 'm3u_url',
        url: targetUrl,
        channelCount: result.channels.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true,
      };

      onAddPlaylist(newPlaylist, result.channels);
      setSuccessMsg(`โหลดเพลย์ลิสต์ M3U สำเร็จ (${result.channels.length} ช่อง)`);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการโหลด URL');
    } finally {
      setIsLoading(false);
      setProgressMsg('');
    }
  };

  // ==========================================
  // WISEPLAY W3U HANDLERS
  // ==========================================
  const handleFetchW3uUrl = async () => {
    if (!w3uUrlInput.trim()) {
      setErrorMsg('กรุณากรอก URL ไฟล์เพลย์ลิสต์ Wiseplay (.w3u)');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setProgressMsg('กำลังดาวน์โหลดไฟล์ Wiseplay w3u...');

    try {
      const fetchUrl = `/api/proxy?url=${encodeURIComponent(w3uUrlInput.trim())}`;
      const res = await fetch(fetchUrl);
      if (!res.ok) {
        throw new Error(`ไม่สามารถดาวน์โหลดไฟล์ w3u ได้ (HTTP ${res.status})`);
      }

      const content = await res.text();
      setProgressMsg('กำลังแยกกลุ่มและสถานีในเพลย์ลิสต์ Wiseplay...');

      const parsed = parseW3U(content, w3uPlaylistName || 'Wiseplay Playlist');
      if (parsed.channels.length === 0) {
        throw new Error('ไม่พบสถานีที่สามารถเล่นได้ในไฟล์ w3u');
      }

      const pName = w3uPlaylistName.trim() || parsed.playlistName || 'Wiseplay Playlist';
      const playlistId = `w3u_${Date.now()}`;

      const newPlaylist: PlaylistSource = {
        id: playlistId,
        name: pName,
        type: 'w3u',
        url: w3uUrlInput.trim(),
        channelCount: parsed.channels.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true,
      };

      onAddPlaylist(newPlaylist, parsed.channels);
      setSuccessMsg(`นำเข้าเพลย์ลิสต์ Wiseplay w3u สำเร็จ (${parsed.channels.length} ช่อง)`);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถประมวลผลไฟล์ Wiseplay w3u ได้');
    } finally {
      setIsLoading(false);
      setProgressMsg('');
    }
  };

  const handleParseW3uRaw = () => {
    if (!w3uRawText.trim()) {
      setErrorMsg('กรุณากรอกหรือวางโค้ด JSON รูปแบบ Wiseplay w3u');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const parsed = parseW3U(w3uRawText.trim(), w3uPlaylistName || 'Wiseplay Raw');
      const pName = w3uPlaylistName.trim() || parsed.playlistName || 'Wiseplay Custom';
      const playlistId = `w3u_${Date.now()}`;

      const newPlaylist: PlaylistSource = {
        id: playlistId,
        name: pName,
        type: 'w3u',
        channelCount: parsed.channels.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true,
      };

      onAddPlaylist(newPlaylist, parsed.channels);
      setSuccessMsg(`นำเข้าเพลย์ลิสต์ Wiseplay สำเร็จ (${parsed.channels.length} ช่อง)`);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'โครงสร้าง Wiseplay w3u ไม่ถูกต้อง');
    } finally {
      setIsLoading(false);
    }
  };

  // Sample Wiseplay W3U Demo
  const handleLoadDemoW3u = () => {
    const demoW3u = {
      name: 'Wiseplay Thai & World TV (w3u Demo)',
      author: 'Wiseplay Community',
      image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=200&auto=format&fit=crop',
      groups: [
        {
          name: 'ทีวีดิจิทัลไทย',
          image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_Thailand.svg/320px-Flag_of_Thailand.svg.png',
          stations: [
            {
              name: 'Thai PBS HD',
              url: 'https://thaipbs-live.cdn.byteark.com/live/playlist.m3u8',
              url1: 'https://live.thaipbs.or.th/live/thaipbs.m3u8',
              image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Thai_PBS_logo.svg/300px-Thai_PBS_logo.svg.png',
              isLive: true,
            },
            {
              name: 'ALTV 4 HD',
              url: 'https://altv-live.cdn.byteark.com/live/playlist.m3u8',
              image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/ALTV_Logo.png/300px-ALTV_Logo.png',
              isLive: true,
            },
            {
              name: 'NBT 2HD',
              url: 'https://live.prd.go.th/live/nbt.m3u8',
              image: 'https://upload.wikimedia.org/wikipedia/th/thumb/f/f6/NBT_HD_logo.png/250px-NBT_HD_logo.png',
              isLive: true,
            },
          ],
        },
        {
          name: 'ข่าวนานาชาติ & กีฬา',
          image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&auto=format&fit=crop',
          stations: [
            {
              name: 'Red Bull TV Live Sports',
              url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
              image: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Red_Bull_TV_logo.svg/300px-Red_Bull_TV_logo.svg.png',
              isLive: true,
            },
            {
              name: 'Bloomberg TV News',
              url: 'https://bloomberg.com/mediafeeds/bloomberg-live.m3u8',
              image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Bloomberg_Television_logo.svg/300px-Bloomberg_Television_logo.svg.png',
              isLive: true,
            },
            {
              name: 'NASA TV UHD',
              url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
              image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/300px-NASA_logo.svg.png',
              isLive: true,
            },
          ],
        },
      ],
    };

    setW3uRawText(JSON.stringify(demoW3u, null, 2));
    setW3uPlaylistName('Wiseplay Thai & World TV');
    setW3uSubTab('raw');
    setSuccessMsg('โหลดข้อมูลตัวอย่าง Wiseplay (.w3u) สำเร็จ! กด "บันทึกและนำเข้าเพลย์ลิสต์" ด้านล่างได้เลย');
  };

  // ==========================================
  // FILE UPLOAD HANDLER (.m3u, .w3u, .json)
  // ==========================================
  const handleFileChange = (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    setProgressMsg('กำลังอ่านเนื้อหาไฟล์...');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const result = parseAnyPlaylist(content, file.name);

        if (result.channels.length === 0) {
          throw new Error('ไม่พบข้อมูลช่องรายการในไฟล์ที่เลือก');
        }

        const pName = file.name.replace(/\.[^/.]+$/, '');
        const playlistId = `file_${Date.now()}`;

        const newPlaylist: PlaylistSource = {
          id: playlistId,
          name: pName,
          type: result.type === 'w3u' ? 'w3u' : 'm3u_file',
          channelCount: result.channels.length,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isActive: true,
        };

        onAddPlaylist(newPlaylist, result.channels);
        setSuccessMsg(`นำเข้า ${result.channels.length} ช่อง จากไฟล์ "${file.name}" เรียบร้อยแล้ว`);
        setTimeout(() => {
          onClose();
        }, 1000);
      } catch (err: any) {
        setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการประมวลผลไฟล์');
      } finally {
        setIsLoading(false);
        setProgressMsg('');
      }
    };

    reader.onerror = () => {
      setIsLoading(false);
      setErrorMsg('เกิดข้อผิดพลาดในการอ่านไฟล์');
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl text-white flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5 bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  IPTV Playlist & Server Manager
                </h3>
                <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/20">
                  Xtream & W3U
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                รองรับระบบ Xtream Codes API (XSTREAM), M3U / playlist.m3u และ Wiseplay w3u
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Primary Tabs */}
        <div className="flex border-b border-white/10 bg-[#090909] px-4 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => handleTabChange('xtream')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'xtream'
                ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Server className="h-4 w-4" />
            <span>Xtream Codes (XSTREAM)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('w3u')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'w3u'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Radio className="h-4 w-4" />
            <span>Wiseplay (w3u)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('m3u_url')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'm3u_url'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            <span>playlist.m3u URL</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('file')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'file'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('manage')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'manage'
                ? 'border-white text-white bg-white/10'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Tv className="h-4 w-4" />
            <span>Playlists ({playlists.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Status / Alert Messages */}
          {errorMsg && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {progressMsg && (
            <div className="flex items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-300">
              <Loader2 className="h-4 w-4 text-blue-400 animate-spin shrink-0" />
              <span>{progressMsg}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: XTREAM CODES (XSTREAM API) */}
          {/* ========================================================= */}
          {activeTab === 'xtream' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3.5 flex items-start gap-3">
                <Server className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-orange-300">เชื่อมต่อระบบ IPTV Xtream Codes (Xtream API)</span>
                  <p className="text-white/60 mt-1 leading-relaxed">
                    กรอกข้อมูล Server URL, Username และ Password ของผู้ให้บริการ IPTV ระบบจะดึงหมวดหมู่และช่องรายการสดอัตโนมัติ พร้อมรองรับการเล่นผ่าน HLS (.m3u8)
                  </p>
                </div>
              </div>

              {/* Input Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5 text-orange-400" />
                    Server URL (โฮสต์และพอร์ต เช่น http://example.com:8080)
                  </label>
                  <input
                    type="text"
                    value={xtreamServer}
                    onChange={(e) => setXtreamServer(e.target.value)}
                    placeholder="http://domain.com:8080"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-orange-400" />
                    Username
                  </label>
                  <input
                    type="text"
                    value={xtreamUser}
                    onChange={(e) => setXtreamUser(e.target.value)}
                    placeholder="ชื่อผู้ใช้"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-orange-400" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={xtreamPass}
                    onChange={(e) => setXtreamPass(e.target.value)}
                    placeholder="รหัสผ่าน"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    ชื่อเรียกเพลย์ลิสต์ (ไม่บังคับ)
                  </label>
                  <input
                    type="text"
                    value={xtreamPlaylistName}
                    onChange={(e) => setXtreamPlaylistName(e.target.value)}
                    placeholder="เช่น My Xtream TV"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    รูปแบบสตรีม (Stream Output)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setXtreamFormat('m3u8')}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                        xtreamFormat === 'm3u8'
                          ? 'border-orange-500 bg-orange-500/20 text-orange-300 font-bold'
                          : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      HLS (.m3u8) - แนะนำ
                    </button>
                    <button
                      type="button"
                      onClick={() => setXtreamFormat('ts')}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                        xtreamFormat === 'ts'
                          ? 'border-orange-500 bg-orange-500/20 text-orange-300 font-bold'
                          : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      MPEG-TS (.ts)
                    </button>
                  </div>
                </div>
              </div>

              {/* Xtream Account Status Card */}
              {xtreamAccountInfo && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300">ข้อมูลบัญชีผู้ใช้ Xtream</span>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                      {xtreamAccountInfo.status || 'Active'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-500/20 text-[11px]">
                    <div>
                      <span className="text-white/40 block">ผู้ใช้:</span>
                      <span className="font-semibold text-white truncate block">{xtreamAccountInfo.username}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">วันหมดอายุ:</span>
                      <span className="font-semibold text-emerald-300 truncate block">{xtreamAccountInfo.expDate || 'ไม่จำกัด'}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">การเชื่อมต่อ:</span>
                      <span className="font-semibold text-white block">
                        {xtreamAccountInfo.activeCons || '0'} / {xtreamAccountInfo.maxConnections || '1'} เครื่อง
                      </span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Server Timezone:</span>
                      <span className="font-semibold text-white truncate block">{xtreamAccountInfo.timezone || 'Asia/Bangkok'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTestXtream}
                  disabled={isTestingXtream || isLoading}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-medium text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isTestingXtream ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  ทดสอบการเชื่อมต่อ
                </button>

                <button
                  type="button"
                  onClick={handleConnectXtream}
                  disabled={isLoading || isTestingXtream}
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(234,88,12,0.4)] transition-all disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-white" />}
                  เชื่อมต่อและโหลดช่องรายการสด
                </button>

                <button
                  type="button"
                  onClick={handleLoadDemoXtream}
                  className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-xs flex items-center justify-center gap-1.5 transition-colors"
                  title="ใส่ค่าตัวอย่าง Xtream Codes"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  ตัวอย่าง
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: WISEPLAY (W3U FORMAT) */}
          {/* ========================================================= */}
          {activeTab === 'w3u' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex items-start gap-3">
                <Radio className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-300">รองรับเพลย์ลิสต์ Wiseplay (.w3u)</span>
                  <p className="text-white/60 mt-1 leading-relaxed">
                    Wiseplay เป็นรูปแบบเพลย์ลิสต์ JSON ยอดนิยม (มีโครงสร้าง groups และ stations พร้อมลิงก์สำรอง url1) สามารถโหลดผ่านลิงก์ URL หรืออัปโหลดไฟล์ .w3u ได้เหมือนในแอพ Wiseplay
                  </p>
                </div>
              </div>

              {/* Sub-tabs for Wiseplay */}
              <div className="flex gap-2 border-b border-white/10 pb-2">
                <button
                  type="button"
                  onClick={() => setW3uSubTab('url')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    w3uSubTab === 'url' ? 'bg-emerald-600 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  W3U URL
                </button>
                <button
                  type="button"
                  onClick={() => setW3uSubTab('file')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    w3uSubTab === 'file' ? 'bg-emerald-600 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Upload .w3u File
                </button>
                <button
                  type="button"
                  onClick={() => setW3uSubTab('raw')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    w3uSubTab === 'raw' ? 'bg-emerald-600 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Paste W3U JSON
                </button>

                <div className="ml-auto">
                  <button
                    type="button"
                    onClick={handleLoadDemoW3u}
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                  >
                    <Sparkles className="h-3 w-3" />
                    โหลดตัวอย่าง Wiseplay (.w3u)
                  </button>
                </div>
              </div>

              {/* W3U by URL */}
              {w3uSubTab === 'url' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">
                      URL ของไฟล์ Wiseplay (.w3u)
                    </label>
                    <input
                      type="url"
                      value={w3uUrlInput}
                      onChange={(e) => setW3uUrlInput(e.target.value)}
                      placeholder="https://example.com/playlist.w3u"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">
                      ชื่อเพลย์ลิสต์
                    </label>
                    <input
                      type="text"
                      value={w3uPlaylistName}
                      onChange={(e) => setW3uPlaylistName(e.target.value)}
                      placeholder="เช่น Wiseplay Live TV"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleFetchW3uUrl}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-white" />}
                    ดาวน์โหลดและนำเข้า Wiseplay Playlist
                  </button>
                </div>
              )}

              {/* W3U by File */}
              {w3uSubTab === 'file' && (
                <div className="space-y-3">
                  <input
                    ref={w3uFileInputRef}
                    type="file"
                    accept=".w3u,.json,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange(file);
                    }}
                    className="hidden"
                  />
                  <div
                    onClick={() => w3uFileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/5 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center"
                  >
                    <Upload className="h-8 w-8 text-emerald-400 mb-2" />
                    <p className="text-xs font-semibold text-white">คลิกเพื่อเลือกไฟล์ Wiseplay (.w3u หรือ .json)</p>
                    <p className="text-[11px] text-white/40 mt-1">รองรับโครงสร้าง groups, stations และ url1 สำรอง</p>
                  </div>
                </div>
              )}

              {/* W3U Raw JSON */}
              {w3uSubTab === 'raw' && (
                <div className="space-y-3">
                  <textarea
                    rows={6}
                    value={w3uRawText}
                    onChange={(e) => setW3uRawText(e.target.value)}
                    placeholder='วางโค้ด JSON ของ Wiseplay เช่น: { "name": "My List", "groups": [ { "name": "News", "stations": [...] } ] }'
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-mono text-white placeholder:text-white/20 focus:border-emerald-500 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={handleParseW3uRaw}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-white" />}
                    บันทึกและนำเข้าเพลย์ลิสต์ Wiseplay
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: M3U URL / PLAYLIST.M3U */}
          {/* ========================================================= */}
          {activeTab === 'm3u_url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center justify-between">
                  <span>URL ไฟล์เพลย์ลิสต์ (เช่น playlist.m3u หรือ .m3u8)</span>
                  <span className="text-[10px] text-blue-400 font-mono">playlist.m3u</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={m3uUrlInput}
                    onChange={(e) => setM3uUrlInput(e.target.value)}
                    placeholder="https://example.com/playlist.m3u หรือ .m3u8"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  ชื่อเพลย์ลิสต์
                </label>
                <input
                  type="text"
                  value={m3uPlaylistName}
                  onChange={(e) => setM3uPlaylistName(e.target.value)}
                  placeholder="เช่น Thai Public IPTV"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Quick Presets for Thai and Global M3U */}
              <div>
                <span className="text-xs font-semibold text-white/50 block mb-2">ลิงก์ตัวอย่างที่ทดสอบแล้ว:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setM3uUrlInput('https://iptv-org.github.io/iptv/countries/th.m3u');
                      setM3uPlaylistName('Thailand TV (iptv-org)');
                    }}
                    className="text-left p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-xs"
                  >
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>🇹🇭 ช่องทีวีไทย (th.m3u)</span>
                    </div>
                    <span className="text-[10px] text-white/40 truncate block mt-0.5">
                      iptv-org.github.io/iptv/countries/th.m3u
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setM3uUrlInput('https://iptv-org.github.io/iptv/categories/news.m3u');
                      setM3uPlaylistName('Global News Streams');
                    }}
                    className="text-left p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-xs"
                  >
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>🌍 ข่าวนานาชาติ (news.m3u)</span>
                    </div>
                    <span className="text-[10px] text-white/40 truncate block mt-0.5">
                      iptv-org.github.io/iptv/categories/news.m3u
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleFetchM3uUrl()}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-white" />}
                ดาวน์โหลดและบันทึกเพลย์ลิสต์ M3U
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: FILE UPLOAD (.m3u, .w3u, .json, .txt) */}
          {/* ========================================================= */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".m3u,.m3u8,.w3u,.json,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChange(file);
                }}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileChange(file);
                }}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all text-center ${
                  isDragOver
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/15 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-white">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
                <p className="text-xs text-white/40 mt-1">
                  รองรับนามสกุล <strong>.m3u</strong>, <strong>.m3u8</strong>, <strong>.w3u</strong> (Wiseplay) และ <strong>.json</strong>
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: SAVED PLAYLISTS MANAGER */}
          {/* ========================================================= */}
          {activeTab === 'manage' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-white/60 pb-1">
                <span>เพลย์ลิสต์ทั้งหมดที่บันทึกไว้ในอุปกรณ์:</span>
                <span>{playlists.length} รายการ</span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {/* Default Playlist */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    activePlaylistId === 'default'
                      ? 'border-blue-500/80 bg-blue-600/10 shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                      <Tv className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">SiamIPTV Free Stream (ค่าเริ่มต้น)</span>
                        <span className="bg-blue-500/20 text-blue-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
                          DEFAULT
                        </span>
                      </div>
                      <span className="text-[11px] text-white/40">ช่องทีวีดิจิทัลไทย กีฬา และช่องข่าวสาธารณะ</span>
                    </div>
                  </div>
                  <div>
                    {activePlaylistId === 'default' ? (
                      <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> ใช้งานอยู่
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectPlaylist('default');
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
                      >
                        สลับใช้งาน
                      </button>
                    )}
                  </div>
                </div>

                {/* Custom Playlists */}
                {playlists.map((pl) => {
                  const isActive = activePlaylistId === pl.id;
                  let typeColor = 'bg-blue-500/20 text-blue-300';
                  let typeName = 'M3U';

                  if (pl.type === 'xtream') {
                    typeColor = 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
                    typeName = 'XTREAM';
                  } else if (pl.type === 'w3u') {
                    typeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
                    typeName = 'WISEPLAY';
                  }

                  return (
                    <div
                      key={pl.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isActive
                          ? 'border-blue-500/80 bg-blue-600/10 shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 shrink-0">
                          {pl.type === 'xtream' ? (
                            <Server className="h-4 w-4 text-orange-400" />
                          ) : pl.type === 'w3u' ? (
                            <Radio className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <FileText className="h-4 w-4 text-blue-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-xs">
                              {pl.name}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${typeColor}`}>
                              {typeName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-white/40 mt-0.5">
                            <span>{pl.channelCount} ช่องรายการ</span>
                            {pl.accountInfo?.expDate && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-400/80">หมดอายุ: {pl.accountInfo.expDate}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isActive ? (
                          <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> ใช้งานอยู่
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectPlaylist(pl.id);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
                          >
                            สลับใช้งาน
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onDeletePlaylist(pl.id)}
                          className="w-7 h-7 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                          title="ลบเพลย์ลิสต์นี้"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#121212] flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Proxy Bypass: พร้อมใช้งานสำหรับสตรีมที่ติด CORS</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
