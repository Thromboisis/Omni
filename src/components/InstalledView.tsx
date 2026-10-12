import React, { useState, useMemo } from 'react';
import {
  Play,
  Star,
  Search,
  Grid,
  List,
  HardDrive,
  FolderOpen,
  Terminal,
  ExternalLink,
  Plus,
  FolderSearch,
  Info,
  CheckCircle2
} from 'lucide-react';
import { GameItem, GamePlatform, TargetOS } from '../types';
import { PLATFORM_INFO, getCopyableCommand } from '../services/storeProtocols';

interface InstalledViewProps {
  games: GameItem[];
  onLaunchGame: (game: GameItem) => void;
  onSelectGameDetails: (game: GameItem) => void;
  onToggleFavorite: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenScannerModal: () => void;
}

export const InstalledView: React.FC<InstalledViewProps> = ({
  games,
  onLaunchGame,
  onSelectGameDetails,
  onToggleFavorite,
  onOpenAddModal,
  onOpenScannerModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedOs, setSelectedOs] = useState<TargetOS | 'all'>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'title' | 'dateAdded' | 'size'>('title');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [copiedGameId, setCopiedGameId] = useState<string | null>(null);

  // Filter to installed only
  const installedGames = useMemo(() => {
    return games.filter((g) => g.isInstalled);
  }, [games]);

  const totalStorageGb = useMemo(() => {
    return installedGames.reduce((acc, g) => acc + (g.installSizeGb || 0), 0).toFixed(1);
  }, [installedGames]);

  const filteredGames = useMemo(() => {
    return installedGames
      .filter((g) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = g.title.toLowerCase().includes(q);
          const matchesGenre = g.genres.some((genre) => genre.toLowerCase().includes(q));
          if (!matchesTitle && !matchesGenre) return false;
        }
        if (selectedPlatform !== 'all' && g.store !== selectedPlatform) {
          return false;
        }
        if (selectedOs !== 'all') {
          if (g.os !== 'both' && g.os !== selectedOs) return false;
        }
        if (favoritesOnly && !g.isFavorite) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'size') {
          return (b.installSizeGb || 0) - (a.installSizeGb || 0);
        }
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });
  }, [installedGames, searchQuery, selectedPlatform, selectedOs, favoritesOnly, sortBy]);

  const handleCopyCommand = (e: React.MouseEvent, game: GameItem) => {
    e.stopPropagation();
    const cmd = getCopyableCommand(game, 'windows');
    navigator.clipboard.writeText(cmd);
    setCopiedGameId(game.id);
    setTimeout(() => setCopiedGameId(null), 2000);
  };

  const getStoreWebLink = (game: GameItem): string | null => {
    if (game.store === 'steam' && game.storeAppId) {
      return `https://store.steampowered.com/app/${game.storeAppId}`;
    }
    if (game.store === 'gog' && game.storeAppId) {
      return `https://www.gog.com/game/${game.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    }
    if (game.store === 'epic') {
      return 'https://store.epicgames.com';
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Scan Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h2 className="text-base font-bold text-white">Installed Games</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {installedGames.length} games installed locally on disk ({totalStorageGb} GB total). Ready to launch directly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScannerModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            <FolderSearch className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scan Local Folder</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Installed Game</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search installed games by title, executable or genre..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                favoritesOnly
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Favorites</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-medium bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="title">Sort: Title (A-Z)</option>
              <option value="size">Sort: Disk Size</option>
              <option value="dateAdded">Sort: Date Added</option>
            </select>

            <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Store & OS Segments */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
          <span className="text-xs text-slate-500 mr-1">Store:</span>
          {['all', 'steam', 'epic', 'gog', 'standalone'].map((platform) => {
            const label =
              platform === 'all'
                ? 'All'
                : PLATFORM_INFO[platform as GamePlatform]?.name || platform;
            return (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedPlatform === platform
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {label}
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-800 mx-2" />

          <span className="text-xs text-slate-500 mr-1">OS:</span>
          {[
            { id: 'all', label: 'All OS' },
            { id: 'windows', label: 'Windows' },
            { id: 'macos', label: 'macOS' }
          ].map((os) => (
            <button
              key={os.id}
              onClick={() => setSelectedOs(os.id as any)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedOs === os.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {os.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Table */}
      {filteredGames.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No installed games found</h3>
            <p className="text-sm text-slate-400 mt-1">
              Use "Scan Local Folder" to discover games in your Steam/Epic/GOG folders, or add a game and select its executable.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenScannerModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Scan Folders
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
            >
              Add Installed Game
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGames.map((game) => {
            const platformInfo = PLATFORM_INFO[game.store] || PLATFORM_INFO.standalone;
            const storeWebUrl = getStoreWebLink(game);

            return (
              <div
                key={game.id}
                onClick={() => onSelectGameDetails(game)}
                className="group relative bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden flex flex-col justify-between transition-all cursor-pointer hover:shadow-lg hover:shadow-black/40"
              >
                <div>
                  <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
                    <img
                      src={game.banner}
                      alt={game.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.placeholders.dev/?width=600&height=300&text=' + encodeURIComponent(game.title);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(game.id);
                      }}
                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                        game.isFavorite
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                      title={game.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-900/90 text-slate-200 border border-slate-700/80 backdrop-blur-sm">
                        {platformInfo.name}
                      </span>
                      {game.os !== 'both' && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-950/70 text-slate-400 uppercase">
                          {game.os}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {game.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span>{game.installSizeGb ? `${game.installSizeGb} GB` : 'Installed'}</span>
                      {game.executablePath && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[140px] text-slate-500">
                            {game.executablePath.split('\\').pop()?.split('/').pop()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLaunchGame(game);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Launch Game</span>
                    </button>

                    {storeWebUrl && (
                      <a
                        href={storeWebUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                        title="Open Store Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={(e) => handleCopyCommand(e, game)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                      title={copiedGameId === game.id ? 'Copied command!' : 'Copy launch command'}
                    >
                      <Terminal className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectGameDetails(game);
                      }}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                      title="Inspect Game Details"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Store Platform</th>
                  <th className="py-3 px-4">Executable / Target</th>
                  <th className="py-3 px-4 text-right">Size</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredGames.map((game) => (
                  <tr
                    key={game.id}
                    onClick={() => onSelectGameDetails(game)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-medium text-white flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(game.id);
                        }}
                        className={`text-slate-500 hover:text-amber-400 ${
                          game.isFavorite ? 'text-amber-400 fill-current' : ''
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <span className="truncate max-w-xs">{game.title}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                        {PLATFORM_INFO[game.store]?.name || game.store}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 truncate max-w-xs text-[11px]">
                      {game.executablePath || game.protocolUri || 'Store Protocol'}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-400">
                      {game.installSizeGb ? `${game.installSizeGb} GB` : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLaunchGame(game);
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-emerald-400 text-slate-950 font-bold rounded hover:bg-emerald-300 transition-colors"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Launch</span>
                        </button>
                        <button
                          onClick={(e) => handleCopyCommand(e, game)}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Copy Launch Command"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
