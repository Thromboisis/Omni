import React, { useState, useEffect, useMemo } from 'react';
import { Gift, ExternalLink, Check, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Deal, GameItem } from '../types';
import { fetchDeals, getStoreName, getStoreIcon, getStoreDirectLink } from '../services/dealService';

interface FreebiesViewProps {
  ownedGames: GameItem[];
  onToggleOwnedGame: (deal: Deal, currentlyOwned: boolean) => void;
}

const CURATED_FREEBIES: Deal[] = [
  {
    dealID: 'freebie-deus-ex',
    title: 'Deus Ex: Mankind Divided',
    storeID: '25',
    gameID: '144012',
    salePrice: '0.00',
    normalPrice: '29.99',
    savings: '100.000000',
    metacriticScore: '84',
    steamRatingText: 'Very Positive',
    steamRatingPercent: '82',
    steamRatingCount: '34000',
    steamAppID: '337000',
    releaseDate: 1471910400,
    dealRating: '10.0',
    thumb: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/337000/header.jpg'
  },
  {
    dealID: 'freebie-fallout-classic',
    title: 'Fallout: A Post Nuclear Role Playing Game',
    storeID: '7',
    gameID: '881',
    salePrice: '0.00',
    normalPrice: '9.99',
    savings: '100.000000',
    metacriticScore: '89',
    steamRatingText: 'Very Positive',
    steamRatingPercent: '94',
    steamRatingCount: '22000',
    steamAppID: '38400',
    releaseDate: 875664000,
    dealRating: '10.0',
    thumb: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/38400/header.jpg'
  },
  {
    dealID: 'freebie-trackmania',
    title: 'Trackmania',
    storeID: '25',
    gameID: '215124',
    salePrice: '0.00',
    normalPrice: '0.00',
    savings: '100.000000',
    metacriticScore: '74',
    steamRatingText: 'Mostly Positive',
    steamRatingPercent: '75',
    steamRatingCount: '6200',
    steamAppID: '2225070',
    releaseDate: 1593561600,
    dealRating: '9.0',
    thumb: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2225070/header.jpg'
  },
  {
    dealID: 'freebie-the-bridge',
    title: 'The Bridge',
    storeID: '25',
    gameID: '98412',
    salePrice: '0.00',
    normalPrice: '9.99',
    savings: '100.000000',
    metacriticScore: '74',
    steamRatingText: 'Very Positive',
    steamRatingPercent: '88',
    steamRatingCount: '1900',
    steamAppID: '204240',
    releaseDate: 1361491200,
    dealRating: '9.5',
    thumb: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/204240/header.jpg'
  }
];

export const FreebiesView: React.FC<FreebiesViewProps> = ({ ownedGames, onToggleOwnedGame }) => {
  const [freebies, setFreebies] = useState<Deal[]>(CURATED_FREEBIES);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    async function loadLiveFreebies() {
      setLoading(true);
      try {
        const live = await fetchDeals({ upperPrice: 0, pageSize: 20 });
        if (live && live.length > 0) {
          const titles = new Set(live.map((d) => d.title.toLowerCase()));
          const combined = [...live, ...CURATED_FREEBIES.filter((c) => !titles.has(c.title.toLowerCase()))];
          setFreebies(combined);
        }
      } catch (err) {
        console.warn('Using curated freebies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLiveFreebies();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <Gift className="w-3.5 h-3.5" />
            <span>100% Free to Keep Promotions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Weekly Freebies & Limited-Time Giveaways
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Never miss a free game from Epic Games, Steam, or GOG. Claim them on the official stores without any subscription, then keep track of them in your Owned collection.
          </p>
        </div>
      </div>

      {/* Grid of Freebies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {freebies.map((deal) => {
          const owned = isDealOwned(deal);
          const storeName = getStoreName(deal.storeID);
          const storeIcon = getStoreIcon(deal.storeID);
          const directUrl = getStoreDirectLink(deal.storeID, deal.steamAppID);

          return (
            <div
              key={deal.dealID}
              className={`group bg-slate-900/80 border rounded-xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-lg ${
                owned
                  ? 'border-emerald-500/30 opacity-75 hover:opacity-95'
                  : 'border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              <div>
                <div className="relative aspect-[16/9] w-full bg-slate-950">
                  <img
                    src={deal.thumb}
                    alt={deal.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.placeholders.dev/?width=600&height=300&text=' + encodeURIComponent(deal.title);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                  {/* Store Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[11px] text-slate-200">
                    <img src={storeIcon} alt="" className="w-3.5 h-3.5 object-contain" />
                    <span>{storeName}</span>
                  </div>

                  {/* Free vs Owned Badge */}
                  {owned ? (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-bold text-xs shadow-md backdrop-blur-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Owned</span>
                    </div>
                  ) : (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-emerald-500 font-bold text-slate-950 text-xs shadow-md">
                      FREE
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {deal.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 line-through font-mono">
                      ${deal.normalPrice || '19.99'}
                    </span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      $0.00 (100% OFF)
                    </span>
                  </div>

                  {deal.metacriticScore && deal.metacriticScore !== '0' && (
                    <div className="text-[11px] text-slate-400">
                      Metacritic: <span className="font-bold text-slate-200">{deal.metacriticScore}/100</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center gap-2">
                <a
                  href={directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <span>Claim on Store</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

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
            </div>
          );
        })}
      </div>
    </div>
  );
};
