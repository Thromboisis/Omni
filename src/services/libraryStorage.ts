import { DatabaseBackup, DetectedFolderGame, GameItem, GamePlatform, ScanFolderConfig, TargetOS, UserProfile } from '../types';
import { buildProtocolUri } from './storeProtocols';

const STORAGE_KEY = 'omnilaunch_games_library_v3';
const PROFILE_KEY = 'omnilaunch_user_profile_v3';
const FOLDERS_KEY = 'omnilaunch_scan_folders_v3';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Local Gamer',
  preferredOs: 'both',
  avatarSeed: 'player1'
};

export const DEFAULT_SCAN_FOLDERS: ScanFolderConfig[] = [
  {
    id: 'folder-win-steam',
    name: 'Steam Library (Windows Default)',
    path: 'C:\\Program Files (x86)\\Steam\\steamapps\\common',
    store: 'steam',
    isDefault: true
  },
  {
    id: 'folder-win-epic',
    name: 'Epic Games (Windows Default)',
    path: 'C:\\Program Files\\Epic Games',
    store: 'epic',
    isDefault: true
  },
  {
    id: 'folder-win-gog',
    name: 'GOG Games (Windows Default)',
    path: 'C:\\GOG Games',
    store: 'gog',
    isDefault: true
  },
  {
    id: 'folder-mac-steam',
    name: 'Steam Library (macOS Default)',
    path: '~/Library/Application Support/Steam/steamapps/common',
    store: 'steam',
    isDefault: true
  },
  {
    id: 'folder-mac-apps',
    name: 'macOS Applications Folder',
    path: '/Applications',
    store: 'standalone',
    isDefault: true
  }
];

export const DEFAULT_INITIAL_GAMES: GameItem[] = [
  // 1. Installed Games
  {
    id: 'game-bg3',
    title: "Baldur's Gate 3",
    banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg',
    store: 'steam',
    ownedStores: ['steam', 'gog'], // Owned on both Steam and GOG!
    storeAppId: '1086940',
    os: 'both',
    launchType: 'protocol',
    executablePath: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Baldurs Gate 3\\bin\\bg3_dx11.exe',
    launchArgs: '--skip-launcher',
    workingDir: '',
    protocolUri: 'steam://rungameid/1086940',
    isInstalled: true,
    isFavorite: true,
    genres: ['RPG', 'Turn-Based', 'Story Rich'],
    installPath: 'Steam/steamapps/common/Baldurs Gate 3',
    installSizeGb: 122.4,
    notes: 'Act III honor mode. Owned on Steam & GOG.',
    dateAdded: '2026-08-01T12:00:00.000Z'
  },
  {
    id: 'game-cp2077',
    title: 'Cyberpunk 2077',
    banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg',
    store: 'gog',
    ownedStores: ['gog', 'steam'],
    storeAppId: '1423049311',
    os: 'windows',
    launchType: 'protocol',
    executablePath: 'C:\\GOG Games\\Cyberpunk 2077\\bin\\x64\\Cyberpunk2077.exe',
    launchArgs: '',
    workingDir: 'C:\\GOG Games\\Cyberpunk 2077\\bin\\x64',
    protocolUri: 'goggalaxy://openGameView/1423049311',
    isInstalled: true,
    isFavorite: true,
    genres: ['Action RPG', 'Open World', 'Sci-Fi'],
    installPath: 'C:\\GOG Games\\Cyberpunk 2077',
    installSizeGb: 70.2,
    notes: 'Phantom Liberty expansion installed via GOG Galaxy.',
    dateAdded: '2026-08-15T10:00:00.000Z'
  },
  {
    id: 'game-hades2',
    title: 'Hades II',
    banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145350/header.jpg',
    store: 'steam',
    ownedStores: ['steam', 'epic'],
    storeAppId: '1145350',
    os: 'both',
    launchType: 'protocol',
    executablePath: '~/Library/Application Support/Steam/steamapps/common/Hades II/Hades2',
    launchArgs: '',
    workingDir: '',
    protocolUri: 'steam://rungameid/1145350',
    isInstalled: true,
    isFavorite: true,
    genres: ['Roguelike', 'Action', 'Indie'],
    installPath: 'Steam/steamapps/common/Hades II',
    installSizeGb: 10.5,
    notes: 'Steam installation on macOS & Windows.',
    dateAdded: '2026-08-20T16:00:00.000Z'
  },
  {
    id: 'game-celeste',
    title: 'Celeste',
    banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/504230/header.jpg',
    store: 'standalone',
    ownedStores: ['standalone', 'itch', 'epic'],
    storeAppId: '',
    os: 'both',
    launchType: 'executable',
    executablePath: '/Applications/Celeste.app',
    launchArgs: '',
    workingDir: '',
    protocolUri: '',
    isInstalled: true,
    isFavorite: false,
    genres: ['Platformer', 'Precision', 'Indie'],
    installPath: '/Applications/Celeste.app',
    installSizeGb: 1.2,
    notes: 'DRM-free standalone offline copy.',
    dateAdded: '2026-08-22T09:00:00.000Z'
  },

  // 2. Owned Games (Not Installed currently)
  {
    id: 'game-witcher3',
    title: 'The Witcher 3: Wild Hunt',
    banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg',
    store: 'steam',
    ownedStores: ['steam', 'gog'],
    storeAppId: '292030',
    os: 'both',
    launchType: 'protocol',
    executablePath: '',
    launchArgs: '',
    workingDir: '',
    protocolUri: 'steam://rungameid/292030',
    isInstalled: false,
    isFavorite: false,
    genres: ['RPG', 'Open World', 'Fantasy'],
    installPath: '',
    installSizeGb: 50.0,
    notes: 'Owned on Steam and GOG. Ready to install via 1-click protocol.',
    dateAdded: '2026-07-01T10:00:00.000Z'
  },
  {
    id: 'game-alanwake2',
    title: 'Alan Wake 2',
    banner: 'https://cdn2.unrealengine.com/egs-alanwake2-remedyentertainment-g1a-00-1920x1080-1cd17765ec17.jpg',
    store: 'epic',
    ownedStores: ['epic'],
    storeAppId: 'Sugar',
    os: 'windows',
    launchType: 'protocol',
    executablePath: '',
    launchArgs: '',
    workingDir: '',
    protocolUri: 'com.epicgames.launcher://apps/Sugar?action=launch&silent=true',
    isInstalled: false,
    isFavorite: false,
    genres: ['Survival Horror', 'Psychological', 'Action'],
    installPath: '',
    installSizeGb: 86.0,
    notes: 'Owned on Epic Games Store.',
    dateAdded: '2026-09-01T14:30:00.000Z'
  },
  {
    id: 'game-discoelysium',
    title: 'Disco Elysium - The Final Cut',
    banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/632470/header.jpg',
    store: 'gog',
    ownedStores: ['gog'],
    storeAppId: '632470',
    os: 'both',
    launchType: 'protocol',
    executablePath: '',
    launchArgs: '',
    workingDir: '',
    protocolUri: 'goggalaxy://openGameView/632470',
    isInstalled: false,
    isFavorite: false,
    genres: ['RPG', 'Detective', 'Story Rich'],
    installPath: '',
    installSizeGb: 22.0,
    notes: 'Owned DRM-free on GOG.',
    dateAdded: '2026-06-15T12:00:00.000Z'
  }
];

// Profile
export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(DEFAULT_USER_PROFILE));
      return DEFAULT_USER_PROFILE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving user profile:', err);
  }
}

// Scan Folders
export function getStoredScanFolders(): ScanFolderConfig[] {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    if (!raw) {
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(DEFAULT_SCAN_FOLDERS));
      return DEFAULT_SCAN_FOLDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCAN_FOLDERS;
  } catch {
    return DEFAULT_SCAN_FOLDERS;
  }
}

export function saveScanFolders(folders: ScanFolderConfig[]): void {
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  } catch (err) {
    console.error('Error saving scan folders:', err);
  }
}

export function addCustomScanFolder(folder: Omit<ScanFolderConfig, 'id'>): ScanFolderConfig[] {
  const folders = getStoredScanFolders();
  const newFolder: ScanFolderConfig = {
    ...folder,
    id: `custom-folder-${Date.now()}`
  };
  const updated = [newFolder, ...folders];
  saveScanFolders(updated);
  return updated;
}

export function deleteCustomScanFolder(id: string): ScanFolderConfig[] {
  const folders = getStoredScanFolders();
  const updated = folders.filter((f) => f.id !== id);
  saveScanFolders(updated);
  return updated;
}

// Games
export function getStoredGames(): GameItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_GAMES));
      return DEFAULT_INITIAL_GAMES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_GAMES));
      return DEFAULT_INITIAL_GAMES;
    }
    // Migration: ensure ownedStores exists on each item
    return parsed.map((g: any) => ({
      ...g,
      ownedStores: Array.isArray(g.ownedStores) && g.ownedStores.length > 0 ? g.ownedStores : [g.store || 'standalone']
    }));
  } catch (err) {
    console.error('Error loading games from localStorage:', err);
    return DEFAULT_INITIAL_GAMES;
  }
}

export function saveAllGames(games: GameItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  } catch (err) {
    console.error('Error saving games to localStorage:', err);
  }
}

export function upsertGame(game: GameItem): GameItem[] {
  const current = getStoredGames();
  const cleanGame: GameItem = {
    ...game,
    ownedStores: Array.isArray(game.ownedStores) && game.ownedStores.length > 0 ? game.ownedStores : [game.store]
  };
  const index = current.findIndex((g) => g.id === cleanGame.id);
  let updated: GameItem[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = cleanGame;
  } else {
    updated = [cleanGame, ...current];
  }
  saveAllGames(updated);
  return updated;
}

export function deleteGameById(id: string): GameItem[] {
  const current = getStoredGames();
  const updated = current.filter((g) => g.id !== id);
  saveAllGames(updated);
  return updated;
}

export function toggleFavoriteGame(id: string): GameItem[] {
  const current = getStoredGames();
  const updated = current.map((g) => (g.id === id ? { ...g, isFavorite: !g.isFavorite } : g));
  saveAllGames(updated);
  return updated;
}

export function toggleInstalledStatus(id: string, isInstalled: boolean, executablePath?: string): GameItem[] {
  const current = getStoredGames();
  const updated = current.map((g) => {
    if (g.id === id) {
      return {
        ...g,
        isInstalled,
        executablePath: executablePath !== undefined ? executablePath : g.executablePath
      };
    }
    return g;
  });
  saveAllGames(updated);
  return updated;
}

export function toggleStoreOwnership(gameId: string, store: GamePlatform): GameItem[] {
  const current = getStoredGames();
  const updated = current.map((g) => {
    if (g.id === gameId) {
      const stores = new Set(g.ownedStores || [g.store]);
      if (stores.has(store)) {
        if (stores.size > 1) {
          stores.delete(store);
        }
      } else {
        stores.add(store);
      }
      return {
        ...g,
        ownedStores: Array.from(stores)
      };
    }
    return g;
  });
  saveAllGames(updated);
  return updated;
}

// Complete Database Export & Import
export function exportDatabaseBackup(): string {
  const profile = getUserProfile();
  const scanFolders = getStoredScanFolders();
  const games = getStoredGames();

  const backup: DatabaseBackup = {
    version: '3.0',
    exportedAt: new Date().toISOString(),
    profile,
    scanFolders,
    totalGames: games.length,
    games
  };

  return JSON.stringify(backup, null, 2);
}

export function importDatabaseBackup(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, count: 0, error: 'Invalid JSON file format' };
    }

    if (parsed.profile) {
      saveUserProfile({
        name: parsed.profile.name || 'Local Gamer',
        preferredOs: parsed.profile.preferredOs || 'both',
        avatarSeed: parsed.profile.avatarSeed || 'player1'
      });
    }

    if (Array.isArray(parsed.scanFolders) && parsed.scanFolders.length > 0) {
      saveScanFolders(parsed.scanFolders);
    }

    const candidateGames = Array.isArray(parsed) ? parsed : parsed.games;
    if (!Array.isArray(candidateGames)) {
      return { success: false, count: 0, error: 'Missing games catalog in backup' };
    }

    const validGames: GameItem[] = candidateGames.map((item: any, idx: number) => ({
      id: item.id || `imported-${Date.now()}-${idx}`,
      title: item.title || 'Untitled Game',
      banner: item.banner || 'https://images.placeholders.dev/?width=600&height=300&text=Game',
      store: item.store || 'standalone',
      ownedStores: Array.isArray(item.ownedStores) && item.ownedStores.length > 0 ? item.ownedStores : [item.store || 'standalone'],
      storeAppId: item.storeAppId || '',
      os: item.os || 'both',
      launchType: item.launchType || (item.storeAppId ? 'protocol' : 'executable'),
      executablePath: item.executablePath || '',
      launchArgs: item.launchArgs || '',
      workingDir: item.workingDir || '',
      protocolUri: item.protocolUri || buildProtocolUri(item.store || 'standalone', item.storeAppId),
      isInstalled: item.isInstalled ?? true,
      isFavorite: item.isFavorite ?? false,
      genres: Array.isArray(item.genres) ? item.genres : [],
      installPath: item.installPath || '',
      installSizeGb: Number(item.installSizeGb) || 0,
      notes: item.notes || '',
      dateAdded: item.dateAdded || new Date().toISOString()
    }));

    saveAllGames(validGames);
    return { success: true, count: validGames.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Failed to parse database backup' };
  }
}

// Popular games detection table for folder scanner
const KNOWN_GAME_MATCHERS = [
  { keywords: ['baldur', 'bg3'], title: "Baldur's Gate 3", platform: 'steam' as GamePlatform, appId: '1086940', banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg' },
  { keywords: ['cyberpunk'], title: 'Cyberpunk 2077', platform: 'steam' as GamePlatform, appId: '1091500', banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg' },
  { keywords: ['witcher 3', 'witcher3'], title: 'The Witcher 3: Wild Hunt', platform: 'steam' as GamePlatform, appId: '292030', banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg' },
  { keywords: ['hades ii', 'hades 2', 'hades2'], title: 'Hades II', platform: 'steam' as GamePlatform, appId: '1145350', banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145350/header.jpg' },
  { keywords: ['hades'], title: 'Hades', platform: 'steam' as GamePlatform, appId: '1145360', banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg' },
  { keywords: ['celeste'], title: 'Celeste', platform: 'steam' as GamePlatform, appId: '504230', banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/504230/header.jpg' },
  { keywords: ['stardew', 'stardewvalley'], title: 'Stardew Valley', platform: 'steam' as GamePlatform, appId: '413150', banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg' },
  { keywords: ['elden ring', 'eldenring'], title: 'ELDEN RING', platform: 'steam' as GamePlatform, appId: '1245620', banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg' },
  { keywords: ['hollow knight', 'hollowknight'], title: 'Hollow Knight', platform: 'steam' as GamePlatform, appId: '367520', banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg' },
  { keywords: ['portal 2', 'portal2'], title: 'Portal 2', platform: 'steam' as GamePlatform, appId: '620', banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/620/header.jpg' },
  { keywords: ['disco elysium'], title: 'Disco Elysium', platform: 'steam' as GamePlatform, appId: '632470', banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/632470/header.jpg' },
  { keywords: ['alan wake 2', 'alanwake2'], title: 'Alan Wake 2', platform: 'epic' as GamePlatform, appId: 'Sugar', banner: 'https://cdn2.unrealengine.com/egs-alanwake2-remedyentertainment-g1a-00-1920x1080-1cd17765ec17.jpg' },
  { keywords: ['gta v', 'grand theft auto v', 'gtav'], title: 'Grand Theft Auto V', platform: 'steam' as GamePlatform, appId: '271590', banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg' },
  { keywords: ['red dead redemption 2', 'rdr2'], title: 'Red Dead Redemption 2', platform: 'steam' as GamePlatform, appId: '1174180', banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg' }
];

export function analyzeFolderGame(folderName: string, parentPath: string = '', assignedStore?: GamePlatform | 'auto'): DetectedFolderGame {
  const cleanName = folderName.replace(/\.app$/i, '');
  const lower = cleanName.toLowerCase();

  const match = KNOWN_GAME_MATCHERS.find((m) => m.keywords.some((k) => lower.includes(k)));

  const guessedPlatform: GamePlatform = assignedStore && assignedStore !== 'auto'
    ? assignedStore
    : match
    ? match.platform
    : folderName.endsWith('.app')
    ? 'standalone'
    : 'standalone';

  if (match) {
    return {
      folderName,
      guessedTitle: match.title,
      guessedPlatform,
      guessedStoreAppId: match.appId,
      fullPath: parentPath ? `${parentPath}/${folderName}` : folderName,
      selected: true,
      matchScore: 95
    };
  }

  const formattedTitle = cleanName
    .replace(/[._-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    folderName,
    guessedTitle: formattedTitle,
    guessedPlatform,
    fullPath: parentPath ? `${parentPath}/${folderName}` : folderName,
    selected: true,
    matchScore: 60
  };
}
