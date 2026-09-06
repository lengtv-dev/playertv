import React, { useState } from 'react';
import {
  X,
  Sliders,
  ShieldCheck,
  Zap,
  Download,
  Upload,
  RotateCcw,
  Check,
  Code,
  Copy,
} from 'lucide-react';
import { UserSettings } from '../types';
import { exportAllUserData, importAllUserData } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (newSettings: Partial<UserSettings>) => void;
  onClearHistory: () => void;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearHistory,
  onResetDefaults,
}) => {
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showWorkerCode, setShowWorkerCode] = useState<boolean>(false);
  const [testProxyStatus, setTestProxyStatus] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleChange = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onSaveSettings({ [key]: value });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const testProxyConnection = async () => {
    setTestProxyStatus('Testing connection...');
    try {
      let testUrl = '/api/proxy?url=https%3A%2F%2Fthaipbs-live.cdn.byteark.com%2Flive%2Fplaylist.m3u8';
      if (formData.proxyMode === 'worker' && formData.workerUrl.trim()) {
        const sep = formData.workerUrl.includes('?') ? '&' : '?';
        testUrl = `${formData.workerUrl}${sep}url=https%3A%2F%2Fthaipbs-live.cdn.byteark.com%2Flive%2Fplaylist.m3u8`;
      }

      const res = await fetch(testUrl, { method: 'HEAD' });
      if (res.ok) {
        setTestProxyStatus('Connection successful! Proxy is active & operational.');
      } else {
        setTestProxyStatus(`Proxy returned status HTTP ${res.status}`);
      }
    } catch (err: any) {
      setTestProxyStatus(`Test failed: ${err.message || 'Network blocked'}`);
    }
  };

  const handleExportBackup = () => {
    const jsonStr = exportAllUserData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iptv_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const success = importAllUserData(content);
      if (success) {
        window.location.reload();
      } else {
        alert('Invalid backup file format');
      }
    };
    reader.readAsText(file);
  };

  const workerCodeSnippet = `export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.searchParams.get("url");

    if (!target) {
      return new Response("Missing ?url=", { status: 400 });
    }

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/148.0.0.0 Safari/537.36",
      "referer": "https://ball-online.com/",
      "origin": "https://ball-online.com"
    };

    const res = await fetch(target, {
      method: "GET",
      headers: headers
    });

    const newHeaders = new Headers(res.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Access-Control-Allow-Headers", "*");

    return new Response(res.body, {
      status: res.status,
      headers: newHeaders,
    });
  }
};`;

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(workerCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                System Preferences
              </h3>
              <p className="text-xs text-white/50">
                Proxy bypass, stream latency, and local backup configuration
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

        {/* Saved Toast Status */}
        {savedSuccess && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-400">
            <Check className="h-4 w-4" />
            <span>Settings saved automatically to local storage</span>
          </div>
        )}

        <div className="mt-4 space-y-5 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
          {/* Section 1: Stream Proxy Config */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                Stream Proxy Bypass Mode
              </span>
              <span className="text-[10px] text-white/40">Resolve CORS & geo-restrictions</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'auto', label: 'Automatic (Auto)', desc: 'Smart proxy detection' },
                { key: 'builtin', label: 'Local Server Proxy', desc: 'Embedded stream proxy' },
                { key: 'worker', label: 'Cloudflare Worker', desc: 'Custom edge worker' },
                { key: 'direct', label: 'Direct Connect', desc: 'Direct stream feed' },
              ].map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => handleChange('proxyMode', mode.key as any)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    formData.proxyMode === mode.key
                      ? 'border-blue-500 bg-blue-600/20 text-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.25)]'
                      : 'border-white/5 bg-white/5 text-white/60 hover:border-white/15 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-semibold">{mode.label}</span>
                  <span className="text-[10px] text-white/40 leading-tight mt-0.5">{mode.desc}</span>
                </button>
              ))}
            </div>

            {/* Custom Worker URL Input */}
            {formData.proxyMode === 'worker' && (
              <div className="pt-2 space-y-2 border-t border-white/10">
                <label className="block text-xs font-medium text-white/70">
                  Cloudflare Worker Proxy URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.workerUrl}
                    onChange={(e) => handleChange('workerUrl', e.target.value)}
                    placeholder="https://your-worker.yourname.workers.dev"
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={testProxyConnection}
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
                  >
                    Test
                  </button>
                </div>
                {testProxyStatus && (
                  <p className="text-[11px] text-blue-400">{testProxyStatus}</p>
                )}
              </div>
            )}

            {/* Toggle Cloudflare Worker Template View */}
            <div>
              <button
                type="button"
                onClick={() => setShowWorkerCode(!showWorkerCode)}
                className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Code className="h-3.5 w-3.5" />
                {showWorkerCode ? 'Hide Worker Code Template' : 'View Cloudflare Worker Code Template'}
              </button>

              {showWorkerCode && (
                <div className="mt-2 relative rounded-xl border border-white/10 bg-black p-3 text-[11px] font-mono text-white/80">
                  <button
                    type="button"
                    onClick={copyCodeToClipboard}
                    className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white/80 hover:bg-white/20"
                  >
                    {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copiedCode ? 'Copied' : 'Copy'}
                  </button>
                  <pre className="overflow-x-auto">{workerCodeSnippet}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Player & Display Preferences */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
            <span className="flex items-center gap-2 text-xs font-semibold text-white">
              <Zap className="h-4 w-4 text-emerald-400" />
              Playback & Video Engine
            </span>

            {/* Aspect Ratio */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-white/80">Default Aspect Ratio</span>
                <p className="text-[10px] text-white/40">Default scaling mode for streams</p>
              </div>
              <select
                value={formData.aspectRatio}
                onChange={(e) => handleChange('aspectRatio', e.target.value as any)}
                className="rounded-xl border border-white/10 bg-[#121212] px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="16:9">16:9 (Standard Widescreen)</option>
                <option value="4:3">4:3 (Classic TV)</option>
                <option value="fill">Fill (Stretch Full)</option>
                <option value="original">Original (Source Size)</option>
              </select>
            </div>

            {/* Auto Play */}
            <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
              <div>
                <span className="text-xs text-white/80">Autoplay on Channel Select</span>
                <p className="text-[10px] text-white/40">Immediately start stream upon clicking channel</p>
              </div>
              <input
                type="checkbox"
                checked={formData.autoPlay}
                onChange={(e) => handleChange('autoPlay', e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Low Latency Mode */}
            <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
              <div>
                <span className="text-xs text-white/80">Low Latency HLS</span>
                <p className="text-[10px] text-white/40">Minimizes live sport broadcast latency</p>
              </div>
              <input
                type="checkbox"
                checked={formData.lowLatency}
                onChange={(e) => handleChange('lowLatency', e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* TV Mode */}
            <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
              <div>
                <span className="text-xs text-white/80">Smart TV Grid Mode</span>
                <p className="text-[10px] text-white/40">Enlarged channel cards with remote d-pad friendly sizing</p>
              </div>
              <input
                type="checkbox"
                checked={formData.smartTVMode}
                onChange={(e) => handleChange('smartTVMode', e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Section 3: Data Backup & Management */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
            <span className="flex items-center gap-2 text-xs font-semibold text-white">
              <Download className="h-4 w-4 text-sky-400" />
              LocalStorage Backup & Recovery
            </span>

            <div className="flex flex-wrap gap-2">
              {/* Export Backup */}
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Export JSON
              </button>

              {/* Import Backup */}
              <label className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10 transition-colors cursor-pointer">
                <Upload className="h-3.5 w-3.5" />
                Restore Backup
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportBackup}
                />
              </label>

              {/* Clear History */}
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all playback history?')) {
                    onClearHistory();
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 hover:text-red-400 hover:border-red-500/30 transition-colors"
              >
                Clear History
              </button>

              {/* Reset Defaults */}
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset all settings to default values?')) {
                    onResetDefaults();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 hover:text-blue-400 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Defaults
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-end border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
