import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  ExternalLink,
  Download,
  Play,
  Star,
  CheckCircle2,
  Plus,
  Grid,
  List,
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import { GameItem, GamePlatform } from '../types';
import { PLATFORM_INFO, buildInstallUri, launchViaProtocol } from '../services/storeProtocols';

export const STORE_PLATFORM_ICONS: Record<GamePlatform, { name: string; iconUrl: string }> = {
  steam: { name: 'Steam', iconUrl: 'https://www.cheapshark.com/img/stores/icons/0.png' },
  epic: { name: 'Epic Games', iconUrl: 'https://www.cheapshark.com/img/stores/icons/24.png' },
  gog: { name: 'GOG Galaxy', iconUrl: 'https://www.cheapshark.com/img/stores/icons/6.png' },
  ea: { name: 'EA App', iconUrl: 'https://www.cheapshark.com/img/stores/icons/13.png' },
  ubisoft: { name: 'Ubisoft Connect', iconUrl: 'https://www.cheapshark.com/img/stores/icons/17.png' },
  battlenet: { name: 'Battle.net', iconUrl: 'https://www.cheapshark.com/img/stores/icons/30.png' },
  itch: { name: 'itch.io', iconUrl: 'https://www.cheapshark.com/img/stores/icons/23.png' },
  standalone: { name: 'DRM-Free', iconUrl: '' }
};

interface OwnedViewProps {
  games: GameItem[];
  onLaunchGame: (game: GameItem) => void;
  onSelectGameDetails: (game: GameItem) => void;
  onToggleFavorite: (id: string) => void;
  onToggleInstalled: (id: string, isInstalled: boolean) => void;
  onToggleStoreOwnership: (gameId: string, store: GamePlatform) => void;
  onOpenAddModal: () => void;
}

export const OwnedView: React.FC<OwnedViewProps> = ({
  games,
  onLaunchGame,
  onSelectGameDetails,
  onToggleFavorite,
  onToggleInstalled,
  onToggleStoreOwnership,
  onOpenAddModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [installStatusFilter, setInstallStatusFilter] = useState<'all' | 'installed' | 'uninstalled'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [editingStoresGameId, setEditingStoresGameId] = useState<string | null>(null);

  // Compute store breakdown across all ownedStores
  const storeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    games.forEach((g) => {
      const stores = g.ownedStores && g.ownedStores.length > 0 ? g.ownedStores : [g.store];
      stores.forEach((s) => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });
    return counts;
  }, [games]);

  const installedCount = useMemo(() => games.filter((g) => g.isInstalled).length, [games]);
  const uninstalledCount = useMemo(() => games.filter((g) => !g.isInstalled).length, [games]);

  const filteredGames = useMemo(() => {
    return games
      .filter((g) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = g.title.toLowerCase().includes(q);
          const matchesGenre = g.genres.some((genre) => genre.toLowerCase().includes(q));
          if (!matchesTitle && !matchesGenre) return false;
        }
        if (selectedPlatform !== 'all') {
          const stores = g.ownedStores && g.ownedStores.length > 0 ? g.ownedStores : [g.store];
          if (!stores.includes(selectedPlatform as GamePlatform)) return false;
        }
        if (installStatusFilter === 'installed' && !g.isInstalled) return false;
        if (installStatusFilter === 'uninstalled' && !g.isInstalled) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.isInstalled !== b.isInstalled) {
          return a.isInstalled ? -1 : 1;
        }
        return a.title.localeCompare(b.title);
      });
  }, [games, searchQuery, selectedPlatform, installStatusFilter]);

  const handleTriggerInstall = (game: GameItem) => {
    const installUri = buildInstallUri(game.store, game.storeAppId);
    if (installUri) {
      launchViaProtocol(installUri);
    } else {
      window.open(game.protocolUri, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Owned Store Collection</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {games.length} total titles in your catalog ({installedCount} installed · {uninstalledCount} uninstalled). Multiple store icons indicate games owned across several storefronts.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Owned Game</span>
        </button>
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
              placeholder="Search owned collection across all stores..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Install status tabs */}
            <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setInstallStatusFilter('all')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  installStatusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({games.length})
              </button>
              <button
                onClick={() => setInstallStatusFilter('installed')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  installStatusFilter === 'installed' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Installed ({installedCount})
              </button>
              <button
                onClick={() => setInstallStatusFilter('uninstalled')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  installStatusFilter === 'uninstalled' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Not Installed ({uninstalledCount})
              </button>
            </div>

            {/* View mode toggle */}
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

        {/* Store Origin Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
          <span className="text-xs text-slate-500 mr-1">Store:</span>
          {['all', 'steam', 'epic', 'gog', 'standalone'].map((platform) => {
            const count = platform === 'all' ? games.length : storeCounts[platform] || 0;
            const label =
              platform === 'all'
                ? 'All Stores'
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
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid View */}
      {filteredGames.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center max-w-lg mx-auto">
          <Layers className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No owned games found</h3>
          <p className="text-sm text-slate-400 mt-1">
            Add games you own across Steam, Epic Games, or GOG to keep your complete catalog organized.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
          >
            Add Owned Game
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGames.map((game) => {
            const platformInfo = PLATFORM_INFO[game.store] || PLATFORM_INFO.standalone;
            const ownedStores = game.ownedStores && game.ownedStores.length > 0 ? game.ownedStores : [game.store];
            const isEditingStores = editingStoresGameId === game.id;

            return (
              <div
                key={game.id}
                onClick={() => onSelectGameDetails(game)}
                className={`group relative bg-slate-900/80 border rounded-xl overflow-hidden flex flex-col justify-between transition-all cursor-pointer hover:shadow-lg ${
                  game.isInstalled
                    ? 'border-slate-800 hover:border-slate-700'
                    : 'border-slate-800/70 opacity-90'
                }`}
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

                    {/* Multiple Store Icons Strip */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 p-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-700/80">
                      {ownedStores.map((s) => {
                        const iconData = STORE_PLATFORM_ICONS[s];
                        return (
                          <div
                            key={s}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900/90 text-[11px] text-white"
                            title={`Owned on ${iconData?.name || s}`}
                          >
                            {iconData?.iconUrl ? (
                              <img src={iconData.iconUrl} alt="" className="w-3.5 h-3.5 object-contain" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            )}
                            <span className="text-[10px] font-semibold">{iconData?.name.split(' ')[0]}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Installed vs Uninstalled Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      {game.isInstalled ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[10px] font-semibold backdrop-blur-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Installed</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-slate-400 text-[10px] font-medium backdrop-blur-sm">
                          Not Installed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {game.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{game.genres.slice(0, 2).join(' · ') || 'Store Title'}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingStoresGameId(isEditingStores ? null : game.id);
                        }}
                        className="text-[11px] text-emerald-400 hover:underline"
                        title="Edit stores where you own this game"
                      >
                        {ownedStores.length > 1 ? `${ownedStores.length} Stores` : ownedStores[0]} ✎
                      </button>
                    </div>

                    {/* Quick Store Toggle Drawer */}
                    {isEditingStores && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 text-[11px]"
                      >
                        <span className="text-slate-400 block font-semibold">Owned on:</span>
                        <div className="flex flex-wrap gap-1">
                          {(['steam', 'epic', 'gog', 'standalone', 'itch'] as GamePlatform[]).map((st) => {
                            const isOwnedOnStore = ownedStores.includes(st);
                            return (
                              <button
                                key={st}
                                onClick={() => onToggleStoreOwnership(game.id, st)}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                                  isOwnedOnStore
                                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                                    : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800'
                                }`}
                              >
                                {isOwnedOnStore ? '✓ ' : '+ '}
                                {PLATFORM_INFO[st]?.name || st}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    {game.isInstalled ? (
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
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerInstall(game);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                        title="Triggers the store launcher to download and install this game"
                      >
                        <Download className="w-3.5 h-3.5 text-sky-400" />
                        <span>Install via {platformInfo.name}</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleInstalled(game.id, !game.isInstalled);
                      }}
                      className="px-2.5 py-2 text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 whitespace-nowrap"
                      title={game.isInstalled ? 'Mark as Not Installed' : 'Mark as Installed locally'}
                    >
                      {game.isInstalled ? 'Uninstall' : 'Installed'}
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
                  <th className="py-3 px-4">Owned Storefronts</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Store App ID</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredGames.map((game) => {
                  const ownedStores = game.ownedStores && game.ownedStores.length > 0 ? game.ownedStores : [game.store];

                  return (
                    <tr
                      key={game.id}
                      onClick={() => onSelectGameDetails(game)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-medium text-white">
                        {game.title}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {ownedStores.map((s) => {
                            const iconData = STORE_PLATFORM_ICONS[s];
                            return (
                              <span
                                key={s}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-200"
                                title={`Owned on ${iconData?.name || s}`}
                              >
                                {iconData?.iconUrl && (
                                  <img src={iconData.iconUrl} alt="" className="w-3.5 h-3.5 object-contain" />
                                )}
                                <span>{iconData?.name || s}</span>
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {game.isInstalled ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Installed</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">Not Installed</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {game.storeAppId || '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {game.isInstalled ? (
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
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTriggerInstall(game);
                              }}
                              className="flex items-center gap-1 px-3 py-1 bg-slate-800 text-white font-medium rounded hover:bg-slate-700 transition-colors border border-slate-700"
                            >
                              <Download className="w-3 h-3 text-sky-400" />
                              <span>Install</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
