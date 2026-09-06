import { Channel, XtreamConfig, XtreamAccountInfo } from '../types';
import { categorizeChannel, generateDefaultLogo } from './m3uParser';

/**
 * Normalizes user-entered server URL
 */
export function normalizeServerUrl(url: string): string {
  let cleaned = url.trim();
  if (!cleaned) return '';
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `http://${cleaned}`;
  }
  return cleaned.replace(/\/+$/, '');
}

/**
 * Proxy fetch helper to overcome CORS / mixed-content restrictions in web browser
 */
async function fetchViaProxy(targetUrl: string): Promise<Response> {
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
  try {
    const res = await fetch(proxyUrl);
    return res;
  } catch (err) {
    // If local proxy fails, attempt direct fetch as fallback
    return fetch(targetUrl);
  }
}

/**
 * Validates and authenticates Xtream Codes login credentials
 */
export async function testXtreamAccount(config: XtreamConfig): Promise<{
  success: boolean;
  accountInfo: XtreamAccountInfo;
  error?: string;
}> {
  const server = normalizeServerUrl(config.serverUrl);
  if (!server) {
    return { success: false, accountInfo: {}, error: 'Server URL is required' };
  }
  if (!config.username.trim() || !config.password.trim()) {
    return { success: false, accountInfo: {}, error: 'Username and Password are required' };
  }

  const authUrl = `${server}/player_api.php?username=${encodeURIComponent(
    config.username.trim()
  )}&password=${encodeURIComponent(config.password.trim())}`;

  try {
    const res = await fetchViaProxy(authUrl);
    if (!res.ok) {
      return {
        success: false,
        accountInfo: {},
        error: `Server responded with status HTTP ${res.status} (${res.statusText})`,
      };
    }

    const data = await res.json();

    if (!data || typeof data !== 'object') {
      return {
        success: false,
        accountInfo: {},
        error: 'Invalid response from Xtream server (Not JSON)',
      };
    }

    const userInfo = data.user_info;
    const serverInfo = data.server_info;

    if (!userInfo) {
      return {
        success: false,
        accountInfo: {},
        error: 'Authentication failed. Please verify Server URL, Username, and Password.',
      };
    }

    // Check auth flag
    if (userInfo.auth === 0 || userInfo.status === 'Banned' || userInfo.status === 'Disabled') {
      return {
        success: false,
        accountInfo: {},
        error: `Account is ${userInfo.status || 'invalid / unauthorized'}`,
      };
    }

    // Format expiration date
    let expFormatted = 'Unlimited / Lifetime';
    if (userInfo.exp_date && userInfo.exp_date !== 'null' && userInfo.exp_date !== 0) {
      const expTimestamp = parseInt(userInfo.exp_date, 10);
      if (!isNaN(expTimestamp)) {
        // Xtream epoch is in seconds
        const dateObj = new Date(expTimestamp * 1000);
        expFormatted = dateObj.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
    }

    const accountInfo: XtreamAccountInfo = {
      username: userInfo.username || config.username,
      status: userInfo.status || 'Active',
      expDate: expFormatted,
      isTrial: userInfo.is_trial === '1' || userInfo.is_trial === true,
      activeCons: String(userInfo.active_cons || '0'),
      maxConnections: String(userInfo.max_connections || '1'),
      serverUrl: serverInfo?.url || server,
      serverProtocol: serverInfo?.server_protocol || 'http',
      port: String(serverInfo?.port || '80'),
      timezone: serverInfo?.timezone || 'Asia/Bangkok',
    };

    return { success: true, accountInfo };
  } catch (err: any) {
    return {
      success: false,
      accountInfo: {},
      error: err.message || 'Failed to connect to Xtream Codes server',
    };
  }
}

/**
 * Fetches categories and all live channels from Xtream Codes server
 */
export async function fetchXtreamLiveStreams(
  config: XtreamConfig,
  onProgress?: (message: string) => void
): Promise<{
  channels: Channel[];
  accountInfo: XtreamAccountInfo;
}> {
  const server = normalizeServerUrl(config.serverUrl);
  const user = config.username.trim();
  const pass = config.password.trim();
  const format = config.outputFormat || 'm3u8';

  // 1. Verify account credentials first
  onProgress?.('Authenticating with Xtream Codes server...');
  const authResult = await testXtreamAccount(config);
  if (!authResult.success) {
    throw new Error(authResult.error || 'Xtream authentication failed');
  }

  // 2. Fetch Live Categories
  onProgress?.('Loading channel categories...');
  const categoriesUrl = `${server}/player_api.php?username=${encodeURIComponent(
    user
  )}&password=${encodeURIComponent(pass)}&action=get_live_categories`;

  const categoryMap: Record<string, string> = {};
  try {
    const catRes = await fetchViaProxy(categoriesUrl);
    if (catRes.ok) {
      const catData = await catRes.json();
      if (Array.isArray(catData)) {
        catData.forEach((cat: any) => {
          if (cat.category_id && cat.category_name) {
            categoryMap[String(cat.category_id)] = String(cat.category_name);
          }
        });
      }
    }
  } catch (e) {
    console.warn('Could not fetch Xtream categories, proceeding with default names', e);
  }

  // 3. Fetch Live Streams list
  onProgress?.('Fetching live channels directory...');
  const streamsUrl = `${server}/player_api.php?username=${encodeURIComponent(
    user
  )}&password=${encodeURIComponent(pass)}&action=get_live_streams`;

  const streamRes = await fetchViaProxy(streamsUrl);
  if (!streamRes.ok) {
    throw new Error(`Failed to load live streams: HTTP ${streamRes.status}`);
  }

  const streamsData = await streamRes.json();
  if (!Array.isArray(streamsData)) {
    throw new Error('Invalid live streams response received from Xtream server');
  }

  onProgress?.(`Processing ${streamsData.length} channels...`);

  const channels: Channel[] = streamsData
    .filter((item: any) => item && (item.stream_id || item.name))
    .map((item: any, idx: number) => {
      const streamId = item.stream_id;
      const streamUrl = `${server}/live/${user}/${pass}/${streamId}.${format}`;
      const groupName = categoryMap[String(item.category_id)] || item.category_name || 'Live Streams';
      const channelName = item.name ? String(item.name).trim() : `Channel ${idx + 1}`;
      const logo = item.stream_icon || generateDefaultLogo(channelName);
      const category = categorizeChannel(channelName, groupName);

      let resolution = 'HD';
      const lower = channelName.toLowerCase();
      if (lower.includes('4k') || lower.includes('uhd')) {
        resolution = '4K';
      } else if (lower.includes('full hd') || lower.includes('1080') || lower.includes('fhd')) {
        resolution = 'Full HD';
      } else if (lower.includes('sd') || lower.includes('576')) {
        resolution = 'SD';
      }

      return {
        id: `xtream_${streamId}_${idx}`,
        name: channelName,
        url: streamUrl,
        logo,
        category,
        groupTitle: groupName,
        tvgId: item.epg_channel_id || String(streamId),
        resolution,
        isLive: true,
        isCustom: true,
        sourcePlaylist: `Xtream (${authResult.accountInfo.serverUrl || server})`,
        sourceType: 'xtream' as const,
        streamId: streamId,
        description: `Xtream ID: #${streamId} | Category: ${groupName}`,
      };
    });

  return {
    channels,
    accountInfo: authResult.accountInfo,
  };
}

/**
 * Returns direct Xtream M3U Plus URL
 */
export function getXtreamM3uUrl(config: XtreamConfig): string {
  const server = normalizeServerUrl(config.serverUrl);
  const user = encodeURIComponent(config.username.trim());
  const pass = encodeURIComponent(config.password.trim());
  const format = config.outputFormat || 'm3u8';
  return `${server}/get.php?username=${user}&password=${pass}&type=m3u_plus&output=${format}`;
}
