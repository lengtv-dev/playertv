import { UserSettings } from '../types';

/**
 * Resolves stream URL through proxy if required
 */
export function resolveStreamUrl(
  rawUrl: string,
  settings: UserSettings,
  forceProxy = false
): string {
  if (!rawUrl) return '';

  // If URL is already a proxy or relative URL, return as is
  if (rawUrl.startsWith('/api/proxy') || rawUrl.includes('corsproxy.io')) {
    return rawUrl;
  }

  // Check proxy mode
  const mode = settings.proxyMode || 'auto';

  if (mode === 'direct' && !forceProxy) {
    return rawUrl;
  }

  if (mode === 'worker' && settings.workerUrl?.trim()) {
    const worker = settings.workerUrl.trim();
    const separator = worker.includes('?') ? '&' : '?';
    return `${worker}${separator}url=${encodeURIComponent(rawUrl)}`;
  }

  if (mode === 'builtin') {
    return `/api/proxy?url=${encodeURIComponent(rawUrl)}`;
  }

  // Mode is 'auto'
  // Domains known to require CORS headers or referer bypass (like ball-online.com)
  const isCORSRestricted =
    rawUrl.includes('ball-online.com') ||
    rawUrl.includes('doodii.me') ||
    forceProxy;

  if (isCORSRestricted) {
    if (settings.workerUrl?.trim()) {
      const worker = settings.workerUrl.trim();
      const separator = worker.includes('?') ? '&' : '?';
      return `${worker}${separator}url=${encodeURIComponent(rawUrl)}`;
    }
    // Default to built-in proxy in dev or client-side CORS proxy
    return `/api/proxy?url=${encodeURIComponent(rawUrl)}`;
  }

  return rawUrl;
}
