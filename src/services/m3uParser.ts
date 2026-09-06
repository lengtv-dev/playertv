import { Channel, CategoryKey } from '../types';

/**
 * Intelligent categorization of channel by title or group-title
 */
export function categorizeChannel(title: string, groupTitle?: string): CategoryKey {
  const combined = `${title} ${groupTitle || ''}`.toLowerCase();

  // News
  if (
    combined.includes('bbc') ||
    combined.includes('cnn') ||
    combined.includes('nhk') ||
    combined.includes('cna') ||
    combined.includes('france24') ||
    combined.includes('dw') ||
    combined.includes('ข่าว') ||
    combined.includes('topnew') ||
    combined.includes('nation') ||
    combined.includes('tnn') ||
    combined.includes('new1')
  ) {
    return 'news';
  }

  // Animation & Kids
  if (
    combined.includes('อนิเมะ') ||
    combined.includes('anime') ||
    combined.includes('dreamwork') ||
    combined.includes('nick') ||
    combined.includes('cartoon') ||
    combined.includes('cn') ||
    combined.includes('boomerang') ||
    combined.includes('sparkplay') ||
    combined.includes('kids')
  ) {
    return 'anime';
  }

  // Thai Digital TV
  if (
    combined.includes('one31') ||
    combined.includes('gmm25') ||
    combined.includes('ch 7') ||
    combined.includes('3hd') ||
    combined.includes('amarin') ||
    combined.includes('thaipbs') ||
    combined.includes('thairath') ||
    combined.includes('true4u') ||
    combined.includes('true24') ||
    combined.includes('pptv') ||
    combined.includes('workpoint') ||
    combined.includes('ch8') ||
    combined.includes('9mcot') ||
    combined.includes('ch 5') ||
    combined.includes('nbt') ||
    combined.includes('jkn18') ||
    combined.includes('t sport 7')
  ) {
    return 'thaidigtv';
  }

  // Movies & Series
  if (
    combined.includes('film') ||
    combined.includes('movie') ||
    combined.includes('hbo') ||
    combined.includes('cinemax') ||
    combined.includes('warner') ||
    combined.includes('celestial') ||
    combined.includes('serie') ||
    combined.includes('cinema') ||
    combined.includes('ภาพยนตร์') ||
    combined.includes('ละคร') ||
    combined.includes('ซีรีส์')
  ) {
    return 'movies';
  }

  // Documentary
  if (
    combined.includes('discovery') ||
    combined.includes('history') ||
    combined.includes('sci') ||
    combined.includes('wild') ||
    combined.includes('samrujlok') ||
    combined.includes('สำรวจโลก') ||
    combined.includes('animal') ||
    combined.includes('สารคดี') ||
    combined.includes('tlc') ||
    combined.includes('khongdee')
  ) {
    return 'documentary';
  }

  // Sports
  if (
    combined.includes('sport') ||
    combined.includes('premier') ||
    combined.includes('bein') ||
    combined.includes('true sport') ||
    combined.includes('siam') ||
    combined.includes('ballthai') ||
    combined.includes('league') ||
    combined.includes('เจลีค') ||
    combined.includes('j league') ||
    combined.includes('k league') ||
    combined.includes('spotv') ||
    combined.includes('lumpinee') ||
    combined.includes('nfl') ||
    combined.includes('nba') ||
    combined.includes('tennis') ||
    combined.includes('atp') ||
    combined.includes('golf') ||
    combined.includes('pga') ||
    combined.includes('lfc') ||
    combined.includes('mutv') ||
    combined.includes('realmarid') ||
    combined.includes('bundesliga') ||
    combined.includes('fivb') ||
    combined.includes('volleyball') ||
    combined.includes('motogp') ||
    combined.includes('f1') ||
    combined.includes('dazn') ||
    combined.includes('wwe') ||
    combined.includes('boxing') ||
    combined.includes('มวย') ||
    combined.includes('fight') ||
    combined.includes('cage warrior') ||
    combined.includes('bg sport') ||
    combined.includes('max') ||
    combined.includes('avc')
  ) {
    return 'sports';
  }

  // Variety & Lifestyle
  if (
    combined.includes('variety') ||
    combined.includes('fashion') ||
    combined.includes('food') ||
    combined.includes('af') ||
    combined.includes('axn') ||
    combined.includes('rush') ||
    combined.includes('alure') ||
    combined.includes('rock') ||
    combined.includes('mvtv') ||
    combined.includes('cool') ||
    combined.includes('prime')
  ) {
    return 'variety';
  }

  return 'variety';
}

/**
 * Parses standard M3U/M3U8 raw content into Channel list
 */
export function parseM3U(content: string, playlistName = 'Imported'): Channel[] {
  const lines = content.split(/\r?\n/);
  const channels: Channel[] = [];

  let currentTitle = '';
  let currentLogo = '';
  let currentGroup = '';
  let currentTvgId = '';
  let currentRes = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      // Parse attributes
      // e.g. #EXTINF:-1 tvg-id="id" tvg-name="Name" tvg-logo="url" group-title="Group", Channel Name
      const logoMatch = line.match(/tvg-logo=["'](.*?)["']/i);
      const groupMatch = line.match(/group-title=["'](.*?)["']/i);
      const idMatch = line.match(/tvg-id=["'](.*?)["']/i);

      currentLogo = logoMatch ? logoMatch[1] : '';
      currentGroup = groupMatch ? groupMatch[1] : '';
      currentTvgId = idMatch ? idMatch[1] : '';

      // Title is everything after the last comma
      const commaIndex = line.lastIndexOf(',');
      if (commaIndex !== -1) {
        currentTitle = line.substring(commaIndex + 1).trim();
      } else {
        currentTitle = `Channel ${channels.length + 1}`;
      }

      if (currentTitle.toLowerCase().includes('4k') || line.toLowerCase().includes('4k')) {
        currentRes = '4K';
      } else if (currentTitle.toLowerCase().includes('full hd') || line.toLowerCase().includes('1080')) {
        currentRes = 'Full HD';
      } else if (currentTitle.toLowerCase().includes('hd') || line.toLowerCase().includes('720')) {
        currentRes = 'HD';
      } else {
        currentRes = 'HD';
      }
    } else if (!line.startsWith('#')) {
      // This line is the stream URL
      const streamUrl = line.trim();
      if (streamUrl.startsWith('http://') || streamUrl.startsWith('https://') || streamUrl.startsWith('/')) {
        const id = `m3u_${Date.now()}_${channels.length}_${Math.random().toString(36).substring(2, 6)}`;
        const category = categorizeChannel(currentTitle, currentGroup);

        channels.push({
          id,
          name: currentTitle || `Channel ${channels.length + 1}`,
          url: streamUrl,
          logo: currentLogo || generateDefaultLogo(currentTitle),
          category,
          groupTitle: currentGroup || undefined,
          tvgId: currentTvgId || undefined,
          resolution: currentRes || 'HD',
          isLive: true,
          isCustom: true,
          sourcePlaylist: playlistName,
        });

        // Reset
        currentTitle = '';
        currentLogo = '';
        currentGroup = '';
        currentTvgId = '';
        currentRes = '';
      }
    }
  }

  return channels;
}

/**
 * Parses JSON channel list (supporting user prompt format)
 */
export function parseJSONChannels(jsonString: string, playlistName = 'Custom JSON'): Channel[] {
  try {
    const rawData = JSON.parse(jsonString);
    if (!Array.isArray(rawData)) {
      throw new Error('JSON playlist must be an array of channels');
    }

    return rawData
      .filter((item: any) => item && (item.url || item.stream_url || item.streamUrl))
      .map((item: any, index: number) => {
        const title = item.title || item.name || item.channel_name || `Channel ${index + 1}`;
        const url = item.url || item.stream_url || item.streamUrl;
        const logo = item.poster || item.logo || item.icon || item.image || generateDefaultLogo(title);
        const group = item.group || item.category || item.group_title;
        const category = categorizeChannel(title, group);

        let resolution = 'HD';
        if (title.toLowerCase().includes('full hd') || title.toLowerCase().includes('1080')) {
          resolution = 'Full HD';
        } else if (title.toLowerCase().includes('4k')) {
          resolution = '4K';
        }

        return {
          id: String(item.channel_id || item.id || `json_${index}_${Date.now()}`),
          name: title,
          url,
          logo,
          category,
          groupTitle: group,
          resolution,
          isLive: true,
          isCustom: true,
          sourcePlaylist: playlistName,
        };
      });
  } catch (err: any) {
    throw new Error('ไม่สามารถอ่านไฟล์ JSON ได้: ' + err.message);
  }
}

/**
 * Checks if content is Wiseplay W3U JSON format
 */
export function isW3UFormat(rawString: string): boolean {
  try {
    const trimmed = rawString.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return false;
    const data = JSON.parse(trimmed);
    if (typeof data === 'object' && data !== null) {
      if ('groups' in data && Array.isArray(data.groups)) return true;
      if ('stations' in data && Array.isArray(data.stations)) return true;
      if (Array.isArray(data) && data.length > 0 && ('stations' in data[0] || 'url' in data[0])) return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Parses Wiseplay .w3u JSON playlist structure into Channel array
 */
export function parseW3U(content: string, fallbackPlaylistName = 'Wiseplay Playlist'): {
  playlistName: string;
  channels: Channel[];
} {
  try {
    const data = JSON.parse(content);
    const channels: Channel[] = [];
    const playlistName = data.name || data.title || fallbackPlaylistName;

    // Helper to process station item
    const processStation = (station: any, groupName: string, index: number) => {
      const url = station.url || station.streamUrl || station.videoUrl || station.link;
      if (!url || typeof url !== 'string') return;

      const title = station.name || station.title || `Station ${index + 1}`;
      const logo = station.image || station.logo || station.icon || generateDefaultLogo(title);
      const category = categorizeChannel(title, groupName);

      let resolution = 'HD';
      const lower = title.toLowerCase();
      if (lower.includes('4k') || lower.includes('uhd')) {
        resolution = '4K';
      } else if (lower.includes('full hd') || lower.includes('1080') || lower.includes('fhd')) {
        resolution = 'Full HD';
      } else if (lower.includes('sd') || lower.includes('576')) {
        resolution = 'SD';
      }

      const id = `w3u_${Date.now()}_${channels.length}_${Math.random().toString(36).substring(2, 6)}`;

      channels.push({
        id,
        name: title,
        url: url.trim(),
        backupUrl: station.url1 ? String(station.url1).trim() : undefined,
        logo,
        category,
        groupTitle: groupName || undefined,
        resolution,
        isLive: station.isLive !== false,
        isCustom: true,
        sourcePlaylist: playlistName,
        sourceType: 'w3u',
        referer: station.referer || undefined,
        userAgent: station.userAgent || undefined,
        description: station.info || station.description || `Wiseplay: ${groupName || 'Live'}`,
      });
    };

    // Case 1: Root object with "groups" array
    if (data.groups && Array.isArray(data.groups)) {
      data.groups.forEach((group: any, gIdx: number) => {
        const groupName = group.name || group.title || `Group ${gIdx + 1}`;
        if (group.stations && Array.isArray(group.stations)) {
          group.stations.forEach((st: any, sIdx: number) => {
            processStation(st, groupName, sIdx);
          });
        }
      });
    }

    // Case 2: Root object with "stations" array
    if (data.stations && Array.isArray(data.stations)) {
      data.stations.forEach((st: any, sIdx: number) => {
        processStation(st, data.name || 'Wiseplay Live', sIdx);
      });
    }

    // Case 3: Raw array of groups or stations
    if (Array.isArray(data)) {
      data.forEach((item: any, idx: number) => {
        if (item.stations && Array.isArray(item.stations)) {
          const groupName = item.name || `Group ${idx + 1}`;
          item.stations.forEach((st: any, sIdx: number) => {
            processStation(st, groupName, sIdx);
          });
        } else if (item.url) {
          processStation(item, item.group || 'Wiseplay Live', idx);
        }
      });
    }

    if (channels.length === 0) {
      throw new Error('ไม่พบข้อมูลสถานี (stations) ที่ถูกต้องในรูปแบบ Wiseplay W3U');
    }

    return { playlistName, channels };
  } catch (err: any) {
    throw new Error('ไม่สามารถอ่านไฟล์ Wiseplay W3U ได้: ' + err.message);
  }
}

/**
 * Intelligent single entry point to parse M3U, W3U, or standard JSON playlists
 */
export function parseAnyPlaylist(
  content: string,
  sourceName = 'Imported Playlist'
): {
  type: 'm3u' | 'w3u' | 'json';
  channels: Channel[];
  name: string;
} {
  const trimmed = content.trim();

  // 1. Check if Wiseplay W3U
  if (isW3UFormat(trimmed)) {
    const { playlistName, channels } = parseW3U(trimmed, sourceName);
    return { type: 'w3u', channels, name: playlistName };
  }

  // 2. Check if generic JSON array
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const channels = parseJSONChannels(trimmed, sourceName);
    return { type: 'json', channels, name: sourceName };
  }

  // 3. Parse as M3U / M3U8
  const channels = parseM3U(trimmed, sourceName);
  return { type: 'm3u', channels, name: sourceName };
}

/**
 * Generates an aesthetic monogram or fallback logo based on channel title
 */
export function generateDefaultLogo(title: string): string {
  const cleanTitle = title.replace(/[^a-zA-Z0-9ก-๙ ]/g, '').trim();
  const text = cleanTitle.substring(0, 3).toUpperCase() || 'TV';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(text)}&background=18181b&color=e4e4e7&size=200&bold=true&font-size=0.4`;
}
