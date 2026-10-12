import React, { useState } from 'react';
import { X, HelpCircle, Laptop, ShieldCheck, Terminal, Compass, CheckCircle2, FileCode, ShoppingBag, HardDrive, Layers, Monitor } from 'lucide-react';

interface PlatformGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlatformGuideModal: React.FC<PlatformGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'architecture' | 'standalone' | 'structure' | 'desktop_install'>('architecture');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">
              OmniLaunch Architecture & Execution Guide
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'architecture'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            How Games Launch
          </button>
          <button
            onClick={() => setActiveTab('standalone')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'standalone'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Running Standalone Executables
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'structure'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Installed vs. Owned vs. Deals
          </button>
          <button
            onClick={() => setActiveTab('desktop_install')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'desktop_install'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Desktop Packaging & Local Config
          </button>
        </div>

        {/* Content by active tab */}
        <div className="text-xs text-slate-300 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-emerald-400" />
                  <span>Direct 1-Click Game Launching on Windows & macOS</span>
                </h4>
                <p>
                  Store clients (Steam, Epic Games, GOG Galaxy, EA App, Battle.net, etc.) register native OS protocol schemes when installed on your computer. When you click <strong className="text-emerald-400">Launch Game</strong>, OmniLaunch invokes the standard system protocol handler:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 font-mono text-[11px]">
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                    <span className="text-white font-bold block">Steam</span>
                    <span className="text-emerald-400">steam://rungameid/1086940</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                    <span className="text-white font-bold block">Epic Games</span>
                    <span className="text-emerald-400">com.epicgames.launcher://apps/...</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                    <span className="text-white font-bold block">GOG Galaxy</span>
                    <span className="text-emerald-400">goggalaxy://openGameView/...</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                    <span className="text-white font-bold block">Battle.net</span>
                    <span className="text-emerald-400">battlenet://Pro</span>
                  </div>
                </div>
                <p className="text-slate-400 pt-1">
                  Windows and macOS hand this directly to the client already installed on your machine. No cloud sync, API tokens, or account linking required.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'standalone' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <FileCode className="w-4 h-4 text-sky-400" />
                  <span>Can OmniLaunch run standalone executables directly?</span>
                </div>
                <div className="space-y-3 text-slate-300">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
                    <strong className="text-emerald-400 block text-xs">Yes! Here is how:</strong>
                    <p className="text-slate-300">
                      When installed and running on your desktop with the built-in local background engine, OmniLaunch features a local process execution endpoint (<code className="text-emerald-400 font-mono">/api/launch-local</code>).
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 mt-1">
                      <li><strong className="text-slate-200">Windows:</strong> Spawns your local <code className="text-emerald-400 font-mono">.exe</code> file directly with your configured launch flags and working directory (e.g. <code className="text-slate-300 font-mono">start "" "D:\Games\Retro\game.exe" -fullscreen</code>).</li>
                      <li><strong className="text-slate-200">macOS:</strong> Spawns application packages with <code className="text-emerald-400 font-mono">open -a "/Applications/Celeste.app"</code> or binary executables.</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-slate-400">
                    <strong className="text-white block mb-0.5">Bonus: Script & Shortcut Generators</strong>
                    <p>
                      OmniLaunch can also export 1-click native desktop batch launchers (<code className="text-emerald-400 font-mono">.bat</code>) for Windows and shell scripts (<code className="text-emerald-400 font-mono">.command</code>) for macOS so you can run games from anywhere.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'structure' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>The 3 Core Pages of OmniLaunch</span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                      <strong className="text-white">1. Installed Page</strong>
                    </div>
                    <p className="text-slate-400">
                      Shows only the games physically present on your disk. Found automatically via the Local Folder Scanner (supporting custom drive locations like <code className="text-emerald-400 font-mono">D:\SteamLibrary</code> or secondary SSDs) or added manually with an executable path.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      <strong className="text-white">2. Owned Page</strong>
                    </div>
                    <p className="text-slate-400">
                      Your master catalog across Steam, Epic Games, GOG, and standalone DRM-free copies. Games can display multiple store badges if you own them on more than one store (e.g. Steam + GOG). Shows both installed and uninstalled games. For uninstalled games, clicking Install initiates the store's download process.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Compass className="w-3.5 h-3.5 text-sky-400" />
                      <strong className="text-white">3. Store Deals & Freebies Pages</strong>
                    </div>
                    <p className="text-slate-400">
                      Aggregates live deals across all major stores without store accounts. Games you already own are highlighted with an <strong className="text-emerald-400">"Owned"</strong> badge and subtly muted so you never accidentally rebuy them. Clicking "Buy on [Store]" takes you directly to that game's store page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'desktop_install' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Monitor className="w-4 h-4" />
                  <span>Desktop Packaging & 100% Local Configuration</span>
                </div>
                <div className="space-y-3 text-slate-400">
                  <p>
                    OmniLaunch is packaged as a standalone Progressive Desktop Application with an integrated local Express backend:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-1">
                    <li><strong className="text-slate-200">Desktop App Installation:</strong> Click "Desktop App" in the top bar to install OmniLaunch directly to your Windows Start Menu / Taskbar or macOS Applications folder / Dock.</li>
                    <li><strong className="text-slate-200">Local Profile:</strong> Customize your gamer profile name (e.g. Jesse) in Settings. No passwords or accounts stored.</li>
                    <li><strong className="text-slate-200">Custom Scan Folders:</strong> Configure custom folders for secondary SSD drives and specific launchers.</li>
                    <li><strong className="text-slate-200">Full JSON Database Export & Restore:</strong> Export your entire library, owned store tags, scan directories, and profile into a single portable JSON file at any time.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
