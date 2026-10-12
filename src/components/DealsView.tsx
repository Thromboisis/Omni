import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  RefreshCw,
  ShoppingBag,
  CheckCircle2,
  Check,
  Plus,
  SlidersHorizontal
} from 'lucide-react';
import { Deal, DealDetails, Store, GameItem } from '../types';
import {
  fetchDeals,
  fetchStores,
  fetchDealDetails,
  getStoreName,
  getStoreIcon,
  getStoreDirectLink,
  STORE_DIRECTORY
} from '../services/dealService';

interface DealsViewProps {
  ownedGames: GameItem[];
  onToggleOwnedGame: (deal: Deal, currentlyOwned: boolean) => void;
}

export const DealsView: React.FC<DealsViewProps> = ({
  ownedGames,
  onToggleOwnedGame
}) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState<number | 'all'>('all');
  const [minSavings, setMinSavings] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'Deal Rating' | 'Savings' | 'Price' | 'Metacritic'>('Deal Rating');
  const [hideOwned, setHideOwned] = useState(false);
  const [compareDeal, setCompareDeal] = useState<Deal | null>(null);
  const [compareDetails, setCompareDetails] = useState<DealDetails | null>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  // Set of steamAppIDs and normalized titles owned by the user
  const ownedAppIds = useMemo(() => {
    return new Set(ownedGames.map((g) => g.storeAppId).filter(Boolean));
  }, [ownedGames]);

  const ownedTitles = useMemo(() => {
    return new Set(
      ownedGames.map((g) => g.title.toLowerCase().replace(/[^a-z0-9]/g, ''))
    );
  }, [ownedGames]);

  const isDealOwned = (deal: Deal): boolean => {
    if (deal.steamAppID && ownedAppIds.has(deal.steamAppID)) return true;
    const cleanDealTitle = deal.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    return ownedTitles.has(cleanDealTitle);
  };

  // Load stores on mount
  useEffect(() => {
    async function initStores() {
      const data = await fetchStores();
      setStores(data);
    }
    initStores();
  }, []);

  // Fetch deals whenever filters change
  const loadDeals = async () => {
    setLoading(true);
    try {
      const params: any = {
        sortBy,
        pageSize: 40
      };
      if (selectedStore !== 'all') {
        params.storeID = selectedStore;
      }
      if (maxPrice !== 'all') {
        params.upperPrice = maxPrice;
      }
      if (searchQuery.trim()) {
        params.title = searchQuery.trim();
      }
      const results = await fetchDeals(params);
      setDeals(results);
    } catch (err) {
      console.error('Error loading deals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDeals();
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedStore, maxPrice, sortBy, searchQuery]);

  // Filter deals locally for min savings and hide-owned toggle
  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      if (minSavings && parseFloat(d.savings) < minSavings) return false;
      if (hideOwned && isDealOwned(d)) return false;
      return true;
    });
  }, [deals, minSavings, hideOwned, ownedAppIds, ownedTitles]);

  // Open store comparison modal
  const handleOpenCompare = async (deal: Deal) => {
    setCompareDeal(deal);
    setLoadingCompare(true);
    try {
      const details = await fetchDealDetails(deal.dealID);
      setCompareDetails(details);
    } catch (err) {
      console.error('Failed to load comparison:', err);
    } finally {
      setLoadingCompare(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store catalog across Steam, Epic, GOG, Humble..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value === 'all' ? 'all' : parseFloat(e.target.value))}
              className="px-3 py-2 text-xs font-medium bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Any Price</option>
              <option value="5">Under $5</option>
              <option value="10">Under $10</option>
              <option value="15">Under $15</option>
              <option value="25">Under $25</option>
              <option value="0">100% Free / $0.00</option>
            </select>

            <select
              value={minSavings}
              onChange={(e) => setMinSavings(parseInt(e.target.value, 10))}
              className="px-3 py-2 text-xs font-medium bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="0">Any Discount</option>
              <option value="50">50%+ Off</option>
              <option value="70">70%+ Off</option>
              <option value="85">85%+ Off</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-medium bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="Deal Rating">Sort: Best Deal Rating</option>
              <option value="Savings">Sort: Biggest Discount</option>
              <option value="Price">Sort: Lowest Price</option>
              <option value="Metacritic">Sort: Highest Metacritic</option>
            </select>

            <button
              onClick={loadDeals}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 disabled:opacity-50"
              title="Refresh Deals"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Store Tabs and Hide Owned Checkbox */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
            <span className="text-xs text-slate-500 mr-1 shrink-0">Store:</span>
            <button
              onClick={() => setSelectedStore('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedStore === 'all'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              All Stores
            </button>

            {Object.entries(STORE_DIRECTORY).map(([id, info]) => (
              <button
                key={id}
                onClick={() => setSelectedStore(id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedStore === id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <img
                  src={info.iconUrl}
                  alt=""
                  className="w-3.5 h-3.5 rounded-sm object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span>{info.name}</span>
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={hideOwned}
              onChange={(e) => setHideOwned(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span>Hide games I already own</span>
          </label>
        </div>
      </div>

      {/* Deals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900/40 border border-slate-800/60 rounded-xl overflow-hidden animate-pulse h-72"
            >
              <div className="aspect-[16/9] bg-slate-800/60" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-800/80 rounded w-3/4" />
                <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                <div className="h-8 bg-slate-800/80 rounded w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center max-w-lg mx-auto">
          <ShoppingBag className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No deals found</h3>
          <p className="text-sm text-slate-400 mt-1">
            Try adjusting filters or unchecking "Hide games I already own".
          </p>
          <button
            onClick={() => {
              setSelectedStore('all');
              setMaxPrice('all');
              setMinSavings(0);
              setSearchQuery('');
              setHideOwned(false);
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredDeals.map((deal) => {
            const savingsPercent = Math.round(parseFloat(deal.savings));
            const owned = isDealOwned(deal);
            const directUrl = getStoreDirectLink(deal.storeID, deal.steamAppID);
            const storeName = getStoreName(deal.storeID);
            const storeIcon = getStoreIcon(deal.storeID);

            return (
              <div
                key={deal.dealID}
                className={`group relative bg-slate-900/80 border rounded-xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-lg ${
                  owned
                    ? 'border-emerald-500/30 opacity-75 hover:opacity-95 bg-slate-950/80'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
                    <img
                      src={deal.thumb}
                      alt={deal.title}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                        owned ? 'saturate-75' : ''
                      }`}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.placeholders.dev/?width=600&height=300&text=' + encodeURIComponent(deal.title);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                    {/* Store badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[11px] text-slate-200">
                      <img
                        src={storeIcon}
                        alt=""
                        className="w-3.5 h-3.5 object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span>{storeName}</span>
                    </div>

                    {/* Savings percentage tag */}
                    {savingsPercent > 0 && !owned && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-emerald-500 font-bold text-slate-950 text-xs shadow-md">
                        -{savingsPercent}%
                      </div>
                    )}

                    {/* Owned Badge Overlay */}
                    {owned && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-bold text-xs shadow-md backdrop-blur-md">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Owned</span>
                      </div>
                    )}
                  </div>

                  {/* Body Details */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-1" title={deal.title}>
                      {deal.title}
                    </h3>

                    {/* Price and Review Strip */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-baseline gap-2 font-mono tabular-nums">
                        {parseFloat(deal.normalPrice) > parseFloat(deal.salePrice) && (
                          <span className="line-through text-slate-500 text-xs">
                            ${deal.normalPrice}
                          </span>
                        )}
                        <span className={`text-base font-bold ${owned ? 'text-slate-400' : 'text-emerald-400'}`}>
                          {parseFloat(deal.salePrice) === 0 ? 'FREE' : `$${deal.salePrice}`}
                        </span>
                      </div>

                      {deal.metacriticScore && deal.metacriticScore !== '0' && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold font-mono ${
                            parseInt(deal.metacriticScore, 10) >= 80
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                          title={`Metacritic Score: ${deal.metacriticScore}/100`}
                        >
                          {deal.metacriticScore}
                        </span>
                      )}
                    </div>

                    {deal.steamRatingText && deal.steamRatingText !== 'N/A' && (
                      <div className="text-[11px] text-slate-400 truncate">
                        Rating: <span className="text-slate-300">{deal.steamRatingText}</span> ({deal.steamRatingPercent}%)
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    {/* View/Buy on store */}
                    <a
                      href={directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors group/link"
                      title={`Open game page on ${storeName}`}
                    >
                      <span>Buy on {storeName}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover/link:text-white" />
                    </a>

                    {/* Toggle Owned Status */}
                    <button
                      onClick={() => onToggleOwnedGame(deal, owned)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                        owned
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-rose-950/50 hover:text-rose-300 hover:border-rose-500/40'
                          : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                      }`}
                      title={owned ? 'Click to unmark as owned' : 'Mark as owned in your collection'}
                    >
                      {owned ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Owned</span>
                        </>
                      ) : (
                        <span>Own it?</span>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenCompare(deal)}
                    className="w-full text-center text-[11px] text-slate-400 hover:text-slate-200 py-1"
                  >
                    Compare prices across all stores →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Multi-store comparison modal */}
      {compareDeal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Store Price Comparison
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{compareDeal.title}</h3>
              </div>
              <button
                onClick={() => setCompareDeal(null)}
                className="text-slate-400 hover:text-white p-1 text-sm"
              >
                ✕
              </button>
            </div>

            {loadingCompare ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                Fetching real-time multi-store quotes...
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current Best Deal:</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">
                    ${compareDeal.salePrice} on {getStoreName(compareDeal.storeID)}
                  </span>
                </div>

                {compareDetails?.cheaperStores && compareDetails.cheaperStores.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-slate-400">Available Stores:</span>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {compareDetails.cheaperStores.map((store) => {
                        const name = getStoreName(store.storeID);
                        const icon = getStoreIcon(store.storeID);
                        const storeUrl = getStoreDirectLink(store.storeID, compareDetails.gameInfo.steamAppID);
                        return (
                          <div
                            key={store.dealID}
                            className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <img src={icon} alt="" className="w-4 h-4 object-contain" />
                              <span className="font-medium text-white">{name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-emerald-400 font-bold">
                                ${store.salePrice}
                              </span>
                              <a
                                href={storeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px]"
                              >
                                <span>Buy on {name}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 py-3">
                    This deal on {getStoreName(compareDeal.storeID)} is currently the lowest registered price across all tracking stores!
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <a
                href={getStoreDirectLink(compareDeal.storeID, compareDeal.steamAppID)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-emerald-400 hover:underline"
              >
                <span>Open Store Page ({getStoreName(compareDeal.storeID)})</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => setCompareDeal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
