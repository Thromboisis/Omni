import { GameItem, GamePlatform, TargetOS } from '../types';

export const PLATFORM_INFO: Record<
  GamePlatform,
  {
    name: string;
    protocolPrefix: string;
    color: string;
    description: string;
    defaultWinPath: string;
    defaultMacPath: string;
  }
> = {
  steam: {
    name: 'Steam',
    protocolPrefix: 'steam://rungameid/',
    color: 'sky',
    description: 'Direct OS Steam URI protocol. Works on Windows and macOS.',
    defaultWinPath: 'C:\\Program Files (x86)\\Steam\\steamapps\\common',
    defaultMacPath: '~/Library/Application Support/Steam/steamapps/common'
  },
  epic: {
    name: 'Epic Games',
    protocolPrefix: 'com.epicgames.launcher://apps/',
    color: 'zinc',
    description: 'Epic Games Launcher URI handler. Works on Windows and macOS.',
    defaultWinPath: 'C:\\Program Files\\Epic Games',
    defaultMacPath: '/Applications'
  },
  gog: {
    name: 'GOG Galaxy',
    protocolPrefix: 'goggalaxy://openGameView/',
    color: 'purple',
    description: 'GOG Galaxy protocol or DRM-free offline executable launch.',
    defaultWinPath: 'C:\\GOG Games',
    defaultMacPath: '/Applications'
  },
  ea: {
    name: 'EA App',
    protocolPrefix: 'origin2://game/launch?offerIds=',
    color: 'orange',
    description: 'EA Desktop / Origin OS launch protocol.',
    defaultWinPath: 'C:\\Program Files\\EA Games',
    defaultMacPath: '/Applications'
  },
  ubisoft: {
    name: 'Ubisoft Connect',
    protocolPrefix: 'uplay://launch/',
    color: 'blue',
    description: 'Ubisoft Connect game launch protocol with game ID.',
    defaultWinPath: 'C:\\Program Files (x86)\\Ubisoft\\Ubisoft Game Launcher\\games',
    defaultMacPath: '/Applications'
  },
  battlenet: {
    name: 'Battle.net',
    protocolPrefix: 'battlenet://',
    color: 'cyan',
    description: 'Blizzard Battle.net game protocol handler.',
    defaultWinPath: 'C:\\Program Files (x86)\\Battle.net',
    defaultMacPath: '/Applications'
  },
  itch: {
    name: 'itch.io',
    protocolPrefix: 'itch://games/',
    color: 'rose',
    description: 'itch.io client protocol or standalone indie executable.',
    defaultWinPath: 'C:\\Users\\%USERNAME%\\AppData\\Roaming\\itch\\apps',
    defaultMacPath: '~/Library/Application Support/itch/apps'
  },
  standalone: {
    name: 'Standalone / DRM-Free',
    protocolPrefix: '',
    color: 'emerald',
    description: 'Direct local binary executable, emulator, or custom script.',
    defaultWinPath: 'C:\\Games',
    defaultMacPath: '/Applications'
  }
};

/**
 * Builds the canonical launch URI for a given store and app ID
 */
export function buildProtocolUri(platform: GamePlatform, appId?: string): string {
  if (!appId) return '';
  const trimmed = appId.trim();
  switch (platform) {
    case 'steam':
      return `steam://rungameid/${trimmed}`;
    case 'epic':
      return `com.epicgames.launcher://apps/${trimmed}?action=launch&silent=true`;
    case 'gog':
      return `goggalaxy://openGameView/${trimmed}`;
    case 'ea':
      return `origin2://game/launch?offerIds=${trimmed}`;
    case 'ubisoft':
      return `uplay://launch/${trimmed}/0`;
    case 'battlenet':
      return `battlenet://${trimmed}`;
    case 'itch':
      return `itch://games/${trimmed}`;
    default:
      return '';
  }
}

/**
 * Builds the canonical store installation URI (triggers client to download/install)
 */
export function buildInstallUri(platform: GamePlatform, appId?: string): string {
  if (!appId) return '';
  const trimmed = appId.trim();
  switch (platform) {
    case 'steam':
      return `steam://install/${trimmed}`;
    case 'epic':
      return `com.epicgames.launcher://apps/${trimmed}?action=install`;
    case 'gog':
      return `goggalaxy://openGameView/${trimmed}`;
    default:
      return buildProtocolUri(platform, appId);
  }
}

/**
 * Attempts direct native local execution via local server backend, falling back to browser protocol
 */
export async function executeGameLaunch(game: GameItem): Promise<{ success: boolean; method: string }> {
  // 1. Native Electron Desktop App Execution
  if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
    try {
      const result = await window.electronAPI.launchGame({
        executablePath: game.executablePath,
        launchArgs: game.launchArgs,
        workingDir: game.workingDir,
        protocolUri: game.protocolUri || buildProtocolUri(game.store, game.storeAppId),
        store: game.store,
        storeAppId: game.storeAppId
      });
      if (result.success) {
        return { success: true, method: result.method || 'native_electron' };
      }
    } catch (err) {
      console.warn('Native Electron launch failed, falling back:', err);
    }
  }

  // 2. Local Node Express server execution endpoint
  try {
    const res = await fetch('/api/launch-local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        executablePath: game.executablePath,
        launchArgs: game.launchArgs,
        protocolUri: game.protocolUri || buildProtocolUri(game.store, game.storeAppId)
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return { success: true, method: data.method };
      }
    }
  } catch (err) {
    // server endpoint unavailable or offline
  }

  // Fallback to browser protocol invocation
  if (game.protocolUri) {
    launchViaProtocol(game.protocolUri);
    return { success: true, method: 'browser_protocol' };
  }

  return { success: false, method: 'none' };
}

/**
 * Triggers OS protocol launch from the web page cleanly
 */
export function launchViaProtocol(uri: string): boolean {
  if (!uri) return false;
  try {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.src = uri;
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
    return true;
  } catch (err) {
    console.error('Failed to trigger protocol:', err);
    window.location.href = uri;
    return true;
  }
}

/**
 * Generates a ready-to-run Windows Batch file (.bat)
 */
export function generateWindowsBatch(game: GameItem): string {
  const exe = game.executablePath || (game.storeAppId ? `steam://rungameid/${game.storeAppId}` : '');
  const args = game.launchArgs ? ` ${game.launchArgs}` : '';
  const workDir = game.workingDir || (game.executablePath ? game.executablePath.substring(0, game.executablePath.lastIndexOf('\\')) : '');

  if (game.launchType === 'protocol' || (!game.executablePath && game.protocolUri)) {
    return `@echo off
:: OmniLaunch Launcher Script for ${game.title}
echo [OmniLaunch] Launching ${game.title} via OS Protocol...
start "" "${game.protocolUri}"
exit
`;
  }

  return `@echo off
:: OmniLaunch Windows Direct Launcher for ${game.title}
title OmniLaunch - ${game.title}
echo [OmniLaunch] Initializing game environment for ${game.title}...
${workDir ? `cd /d "${workDir}"` : ''}
start "" "${exe}"${args}
exit
`;
}

/**
 * Generates a ready-to-run macOS Command file (.command or .sh)
 */
export function generateMacOSCommand(game: GameItem): string {
  const exe = game.executablePath || '';
  const args = game.launchArgs ? ` ${game.launchArgs}` : '';
  const workDir = game.workingDir || (game.executablePath ? game.executablePath.substring(0, game.executablePath.lastIndexOf('/')) : '');

  if (game.launchType === 'protocol' || (!game.executablePath && game.protocolUri)) {
    return `#!/bin/bash
# OmniLaunch macOS Protocol Launcher for ${game.title}
echo "[OmniLaunch] Launching ${game.title}..."
open "${game.protocolUri}"
`;
  }

  const isAppBundle = exe.endsWith('.app');

  return `#!/bin/bash
# OmniLaunch macOS Direct Launcher for ${game.title}
echo "[OmniLaunch] Launching ${game.title}..."
${workDir ? `cd "${workDir}"` : ''}
${isAppBundle ? `open -a "${exe}" --args${args}` : `chmod +x "${exe}" && "${exe}"${args}`}
`;
}

/**
 * Generates a Windows desktop shortcut (.url)
 */
export function generateWindowsShortcut(game: GameItem): string {
  const targetUri = game.protocolUri || (game.executablePath ? `file:///${game.executablePath.replace(/\\/g, '/')}` : '');
  return `[InternetShortcut]
URL=${targetUri}
IconIndex=0
`;
}

/**
 * Downloads a generated launcher script directly to the user's computer
 */
export function downloadLauncherFile(game: GameItem, os: 'windows' | 'macos') {
  let content = '';
  let filename = '';
  let mimeType = 'text/plain';

  const safeTitle = game.title.replace(/[^a-zA-Z0-9_-]/g, '_');

  if (os === 'windows') {
    content = generateWindowsBatch(game);
    filename = `Launch_${safeTitle}.bat`;
  } else {
    content = generateMacOSCommand(game);
    filename = `Launch_${safeTitle}.command`;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Returns terminal command text ready to copy-paste
 */
export function getCopyableCommand(game: GameItem, os: TargetOS): string {
  if (game.launchType === 'protocol' || game.protocolUri) {
    if (os === 'macos') {
      return `open "${game.protocolUri}"`;
    }
    return `start "" "${game.protocolUri}"`;
  }

  if (os === 'macos') {
    if (game.executablePath.endsWith('.app')) {
      return `open -a "${game.executablePath}" ${game.launchArgs ? `--args ${game.launchArgs}` : ''}`.trim();
    }
    return `"${game.executablePath}" ${game.launchArgs}`.trim();
  }

  return `start "" "${game.executablePath}" ${game.launchArgs}`.trim();
}
