export type GamePlatform =
  | 'steam'
  | 'epic'
  | 'gog'
  | 'ea'
  | 'ubisoft'
  | 'battlenet'
  | 'itch'
  | 'standalone';

export type TargetOS = 'windows' | 'macos' | 'both';

export type LaunchType = 'protocol' | 'executable' | 'custom_command';

export interface GameItem {
  id: string;
  title: string;
  banner: string;
  store: GamePlatform;
  ownedStores: GamePlatform[]; // Supports owning the same game on multiple stores!
  storeAppId?: string;
  os: TargetOS;
  launchType: LaunchType;
  executablePath: string;
  launchArgs: string;
  workingDir: string;
  protocolUri: string;
  isInstalled: boolean;
  isFavorite: boolean;
  genres: string[];
  installPath: string;
  installSizeGb?: number;
  notes?: string;
  dateAdded: string;
}

export interface UserProfile {
  name: string;
  preferredOs: TargetOS;
  avatarSeed: string;
}

export interface ScanFolderConfig {
  id: string;
  name: string;
  path: string;
  store: GamePlatform | 'auto';
  isDefault?: boolean;
}

export interface DatabaseBackup {
  version: string;
  exportedAt: string;
  profile: UserProfile;
  scanFolders: ScanFolderConfig[];
  totalGames: number;
  games: GameItem[];
}

export interface Store {
  storeID: string;
  storeName: string;
  isActive: number;
  images: {
    banner?: string;
    logo?: string;
    icon?: string;
  };
}

export interface Deal {
  dealID: string;
  title: string;
  storeID: string;
  gameID: string;
  salePrice: string;
  normalPrice: string;
  savings: string;
  metacriticScore: string;
  steamRatingText?: string;
  steamRatingPercent: string;
  steamRatingCount?: string;
  steamAppID?: string | null;
  releaseDate: number;
  dealRating: string;
  thumb: string;
}

export interface DealDetails {
  gameInfo: {
    name: string;
    salePrice: string;
    retailPrice: string;
    steamAppID?: string;
    thumb: string;
    publisher?: string;
    releaseDate?: number;
    metacriticScore?: string;
  };
  cheaperStores: Array<{
    dealID: string;
    storeID: string;
    salePrice: string;
    retailPrice: string;
  }>;
  cheapestPrice: {
    price: string;
    date: number;
  };
}

export interface DetectedFolderGame {
  folderName: string;
  guessedTitle: string;
  guessedPlatform: GamePlatform;
  guessedStoreAppId?: string;
  fullPath: string;
  sizeGb?: number;
  selected: boolean;
  matchScore: number;
}

export interface ElectronAPI {
  isElectron: boolean;
  platform: 'win32' | 'darwin' | 'linux';
  launchGame: (gameConfig: {
    executablePath: string;
    launchArgs: string;
    workingDir: string;
    protocolUri: string;
    store: GamePlatform;
    storeAppId?: string;
  }) => Promise<{ success: boolean; method?: string; error?: string }>;
  pickExecutable: () => Promise<{ canceled: boolean; filePath: string | null }>;
  pickDirectory: (defaultPath?: string) => Promise<{ canceled: boolean; directoryPath: string | null }>;
  scanDirectory: (
    dirPath: string,
    store?: GamePlatform | 'auto'
  ) => Promise<{ success: boolean; folders?: string[]; error?: string }>;
  openExternal: (url: string) => Promise<boolean>;
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
