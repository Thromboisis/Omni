import { Deal, DealDetails, Store } from '../types';

export const STORE_DIRECTORY: Record<
  string,
  { name: string; iconUrl: string; storeUrl: string; color: string }
> = {
  '1': {
    name: 'Steam',
    iconUrl: 'https://www.cheapshark.com/img/stores/icons/0.png',
    storeUrl: 'https://store.steampowered.com',
    color: '#1b2838'
  },
  '2': {
    name: 'GamersGate',
    iconUrl: 'https://www.cheapshark.com/img/stores/icons/1.png',
    storeUrl: 'https://www.gamersgate.com',
    color: '#e62425'
  },
  '3': {
    name: 'GreenManGaming',
    iconUrl: 'https://www.cheapshark.com/img/stores/icons/2.png',
    storeUrl: 'https://www.greenmangaming.com',
    color: '#5bba14'
  },
  '7': {
    name: 'GOG',
    iconUrl: 'https://www.cheapshark.com/img/stores/icons/6.png',
    storeUrl: 'https://www.gog.com',
    color: '#84329b'
  },
  '11': {
    name: 'Humble Store',
    iconUrl: 'https://www.cheapshark.com/img/stores/icons/10.png',
    storeUrl: 'https://www.humblebundle.com/store',
    color: '#cb2127'
  },
  '15': {
    name: 'Fanatical',
    iconUrl: 'https://www.cheapshark.com/img/stores/icons/14.png',
    storeUrl: 'https://www.fanatical.com',
    color: '#f58220'
  },
  '25': {
    name: 'Epic Games Store',
    iconUrl: 'https://www.cheapshark.com/img/stores/icons/24.png',
    storeUrl: 'https://store.epicgames.com',
    color: '#2a2a2a'
  },
  '27': {
    name: 'Gamesplanet',
    iconUrl: 'https://www.cheapshark.com/img/stores/icons/26.png',
    storeUrl: 'https://us.gamesplanet.com',
    color: '#21759b'
  },
  '31': {
    name: 'Blizzard Battle.net',
    iconUrl: 'https://www.cheapshark.com/img/stores/icons/30.png',
    storeUrl: 'https://shop.battle.net',
    color: '#00aeff'
  }
};

export async function fetchStores(): Promise<Store[]> {
  try {
    const res = await fetch('/api/stores');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Using client store directory fallback:', err);
    return Object.entries(STORE_DIRECTORY).map(([id, info]) => ({
      storeID: id,
      storeName: info.name,
      isActive: 1,
      images: {
        icon: info.iconUrl
      }
    }));
  }
}

export interface DealQueryFilters {
  storeID?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: 'Deal Rating' | 'Title' | 'Savings' | 'Price' | 'Metacritic' | 'Reviews' | 'Release';
  desc?: number;
  lowerPrice?: number;
  upperPrice?: number;
  title?: string;
  metacritic?: number;
  steamRating?: number;
  AAA?: number;
  onSale?: number;
}

export async function fetchDeals(filters: DealQueryFilters = {}): Promise<Deal[]> {
  const params = new URLSearchParams();
  if (filters.storeID && filters.storeID !== 'all') params.append('storeID', filters.storeID);
  if (filters.pageNumber !== undefined) params.append('pageNumber', String(filters.pageNumber));
  params.append('pageSize', String(filters.pageSize || 30));
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.desc !== undefined) params.append('desc', String(filters.desc));
  if (filters.lowerPrice !== undefined) params.append('lowerPrice', String(filters.lowerPrice));
  if (filters.upperPrice !== undefined) params.append('upperPrice', String(filters.upperPrice));
  if (filters.title) params.append('title', filters.title);
  if (filters.metacritic) params.append('metacritic', String(filters.metacritic));
  if (filters.steamRating) params.append('steamRating', String(filters.steamRating));
  if (filters.AAA !== undefined) params.append('AAA', String(filters.AAA));
  if (filters.onSale !== undefined) params.append('onSale', String(filters.onSale));

  try {
    const res = await fetch(`/api/deals?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch deals:', err);
    return [];
  }
}

export async function fetchDealDetails(dealId: string): Promise<DealDetails | null> {
  try {
    const res = await fetch(`/api/deal?id=${encodeURIComponent(dealId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch deal details:', err);
    return null;
  }
}

export function getStoreName(storeId: string): string {
  return STORE_DIRECTORY[storeId]?.name || `Store #${storeId}`;
}

export function getStoreIcon(storeId: string): string {
  return STORE_DIRECTORY[storeId]?.iconUrl || 'https://www.cheapshark.com/img/stores/icons/0.png';
}

export function getStoreDirectLink(storeId: string, steamAppId?: string | null): string {
  if (storeId === '1' && steamAppId) {
    return `https://store.steampowered.com/app/${steamAppId}`;
  }
  return STORE_DIRECTORY[storeId]?.storeUrl || 'https://www.cheapshark.com';
}
