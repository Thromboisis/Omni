import React from 'react';
import {
  HardDrive,
  Layers,
  Compass,
  Gift,
  FolderSearch,
  HelpCircle,
  Plus,
  Monitor,
  User,
  Settings
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'installed' | 'owned' | 'deals' | 'freebies';
  onSelectTab: (tab: 'installed' | 'owned' | 'deals' | 'freebies') => void;
  onOpenAddModal: () => void;
  onOpenScannerModal: () => void;
  onOpenGuideModal: () => void;
  onOpenSettings: () => void;
  onOpenInstallModal: () => void;
  installedCount: number;
  ownedCount: number;
  profileName: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  onOpenScannerModal,
  onOpenGuideModal,
  onOpenSettings,
  onOpenInstallModal,
  installedCount,
  ownedCount,
  profileName
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectTab('installed');
              }}
              className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-emerald-400 transition-colors"
            >
              OmniLaunch
            </a>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-400">
            <button
              onClick={() => onSelectTab('installed')}
              className={`flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentTab === 'installed'
                  ? 'text-white border-b-2 border-emerald-500 font-semibold'
                  : 'hover:text-slate-200'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Installed ({installedCount})</span>
            </button>

            <button
              onClick={() => onSelectTab('owned')}
              className={`flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentTab === 'owned'
                  ? 'text-white border-b-2 border-emerald-500 font-semibold'
                  : 'hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Owned ({ownedCount})</span>
            </button>

            <button
              onClick={() => onSelectTab('deals')}
              className={`flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentTab === 'deals'
                  ? 'text-white border-b-2 border-emerald-500 font-semibold'
                  : 'hover:text-slate-200'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Store Deals</span>
            </button>

            <button
              onClick={() => onSelectTab('freebies')}
              className={`flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentTab === 'freebies'
                  ? 'text-white border-b-2 border-emerald-500 font-semibold'
                  : 'hover:text-slate-200'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Freebies</span>
            </button>

            <button
              onClick={onOpenScannerModal}
              className="flex items-center gap-2 whitespace-nowrap shrink-0 hover:text-slate-200 transition-colors py-1 text-slate-400"
            >
              <FolderSearch className="w-4 h-4" />
              <span>Scanner</span>
            </button>

            <button
              onClick={onOpenGuideModal}
              className="flex items-center gap-2 whitespace-nowrap shrink-0 hover:text-slate-200 transition-colors py-1 text-slate-400"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Guide</span>
            </button>
          </nav>

          {/* Zone 3: Desktop App, Profile Config, and Primary Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Install Desktop App CTA button */}
            <button
              onClick={onOpenInstallModal}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-lg transition-colors"
              title="Packaging & Native Installers (.exe for Windows / .dmg for macOS)"
            >
              <Monitor className="w-3.5 h-3.5 text-emerald-400" />
              <span>Desktop Installer</span>
            </button>

            {/* Profile & Database Backup Config button */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
              title="Local Profile & Database Settings (Custom Scan Folders, Backup JSON)"
            >
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span className="max-w-[90px] truncate">{profileName || 'Profile'}</span>
              <Settings className="w-3 h-3 text-slate-500 ml-0.5" />
            </button>

            {/* Add Game button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Game</span>
            </button>
          </div>
        </div>

        {/* Mobile navigation strip */}
        <div className="md:hidden flex items-center justify-between border-t border-slate-800/80 py-2 text-xs text-slate-400 overflow-x-auto gap-3">
          <button
            onClick={() => onSelectTab('installed')}
            className={`whitespace-nowrap px-2 py-1 rounded ${currentTab === 'installed' ? 'text-white bg-slate-800 font-semibold' : ''}`}
          >
            Installed ({installedCount})
          </button>
          <button
            onClick={() => onSelectTab('owned')}
            className={`whitespace-nowrap px-2 py-1 rounded ${currentTab === 'owned' ? 'text-white bg-slate-800 font-semibold' : ''}`}
          >
            Owned ({ownedCount})
          </button>
          <button
            onClick={() => onSelectTab('deals')}
            className={`whitespace-nowrap px-2 py-1 rounded ${currentTab === 'deals' ? 'text-white bg-slate-800 font-semibold' : ''}`}
          >
            Deals
          </button>
          <button
            onClick={() => onSelectTab('freebies')}
            className={`whitespace-nowrap px-2 py-1 rounded ${currentTab === 'freebies' ? 'text-white bg-slate-800 font-semibold' : ''}`}
          >
            Freebies
          </button>
          <button
            onClick={onOpenScannerModal}
            className="whitespace-nowrap px-2 py-1 rounded"
          >
            Scanner
          </button>
          <button
            onClick={onOpenInstallModal}
            className="whitespace-nowrap px-2 py-1 rounded text-emerald-400"
          >
            Desktop
          </button>
        </div>
      </div>
    </header>
  );
};
