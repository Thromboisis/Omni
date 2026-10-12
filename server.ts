import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { exec } from 'child_process';
import os from 'os';

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// In-memory cache for CheapShark deals and stores
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: {
  stores?: CacheEntry<any>;
  deals?: Map<string, CacheEntry<any>>;
} = {
  deals: new Map()
};

const CACHE_TTL_STORES = 1000 * 60 * 60 * 6; // 6 hours
const CACHE_TTL_DEALS = 1000 * 60 * 10; // 10 minutes

const CHEAPSHARK_BASE = 'https://www.cheapshark.com/api/1.0';
const USER_AGENT = 'OmniLaunch/1.0 (local-desktop-game-manager; contact@omnilaunch.local)';

// Fallback curated stores if upstream is unavailable
const FALLBACK_STORES = [
  { storeID: '1', storeName: 'Steam', isActive: 1, images: { logo: 'https://www.cheapshark.com/img/stores/logos/0.png', icon: 'https://www.cheapshark.com/img/stores/icons/0.png' } },
  { storeID: '25', storeName: 'Epic Games Store', isActive: 1, images: { logo: 'https://www.cheapshark.com/img/stores/logos/24.png', icon: 'https://www.cheapshark.com/img/stores/icons/24.png' } },
  { storeID: '7', storeName: 'GOG', isActive: 1, images: { logo: 'https://www.cheapshark.com/img/stores/logos/6.png', icon: 'https://www.cheapshark.com/img/stores/icons/6.png' } },
  { storeID: '11', storeName: 'Humble Store', isActive: 1, images: { logo: 'https://www.cheapshark.com/img/stores/logos/10.png', icon: 'https://www.cheapshark.com/img/stores/icons/10.png' } },
  { storeID: '15', storeName: 'Fanatical', isActive: 1, images: { logo: 'https://www.cheapshark.com/img/stores/logos/14.png', icon: 'https://www.cheapshark.com/img/stores/icons/14.png' } },
  { storeID: '2', storeName: 'GamersGate', isActive: 1, images: { logo: 'https://www.cheapshark.com/img/stores/logos/1.png', icon: 'https://www.cheapshark.com/img/stores/icons/1.png' } },
  { storeID: '3', storeName: 'GreenManGaming', isActive: 1, images: { logo: 'https://www.cheapshark.com/img/stores/logos/2.png', icon: 'https://www.cheapshark.com/img/stores/icons/2.png' } },
  { storeID: '27', storeName: 'Gamesplanet', isActive: 1, images: { logo: 'https://www.cheapshark.com/img/stores/logos/26.png', icon: 'https://www.cheapshark.com/img/stores/icons/26.png' } },
  { storeID: '31', storeName: 'Blizzard Battle.net', isActive: 1, images: { logo: 'https://www.cheapshark.com/img/stores/logos/30.png', icon: 'https://www.cheapshark.com/img/stores/icons/30.png' } }
];

// Fallback high-value deals
const FALLBACK_DEALS = [
  {
    dealID: 'fallback-cyberpunk',
    title: 'Cyberpunk 2077: Ultimate Edition',
    storeID: '7',
    gameID: '208151',
    salePrice: '35.99',
    normalPrice: '79.99',
    savings: '55.006875',
    metacriticScore: '86',
    steamRatingText: 'Very Positive',
    steamRatingPercent: '83',
    steamRatingCount: '654300',
    steamAppID: '1091500',
    releaseDate: 1607558400,
    dealRating: '9.2',
    thumb: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg'
  },
  {
    dealID: 'fallback-witcher3',
    title: 'The Witcher 3: Wild Hunt - Complete Edition',
    storeID: '1',
    gameID: '143162',
    salePrice: '12.49',
    normalPrice: '49.99',
    savings: '75.015003',
    metacriticScore: '93',
    steamRatingText: 'Overwhelmingly Positive',
    steamRatingPercent: '96',
    steamRatingCount: '789120',
    steamAppID: '292030',
    releaseDate: 1431993600,
    dealRating: '9.8',
    thumb: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg'
  },
  {
    dealID: 'fallback-hades2',
    title: 'Hades II',
    storeID: '1',
    gameID: '254190',
    salePrice: '26.99',
    normalPrice: '29.99',
    savings: '10.003334',
    metacriticScore: '90',
    steamRatingText: 'Overwhelmingly Positive',
    steamRatingPercent: '95',
    steamRatingCount: '58400',
    steamAppID: '1145350',
    releaseDate: 1714953600,
    dealRating: '8.5',
    thumb: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145350/header.jpg'
  },
  {
    dealID: 'fallback-baldur3',
    title: "Baldur's Gate 3",
    storeID: '1',
    gameID: '216752',
    salePrice: '47.99',
    normalPrice: '59.99',
    savings: '20.003334',
    metacriticScore: '96',
    steamRatingText: 'Overwhelmingly Positive',
    steamRatingPercent: '96',
    steamRatingCount: '620000',
    steamAppID: '1086940',
    releaseDate: 1691020800,
    dealRating: '9.4',
    thumb: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg'
  },
  {
    dealID: 'fallback-alanwake2',
    title: 'Alan Wake 2',
    storeID: '25',
    gameID: '260421',
    salePrice: '29.99',
    normalPrice: '49.99',
    savings: '40.008001',
    metacriticScore: '89',
    steamRatingText: 'N/A',
    steamRatingPercent: '0',
    steamRatingCount: '0',
    steamAppID: null,
    releaseDate: 1698364800,
    dealRating: '8.8',
    thumb: 'https://cdn2.unrealengine.com/egs-alanwake2-remedyentertainment-g1a-00-1920x1080-1cd17765ec17.jpg'
  },
  {
    dealID: 'fallback-celeste',
    title: 'Celeste',
    storeID: '1',
    gameID: '179212',
    salePrice: '4.99',
    normalPrice: '19.99',
    savings: '75.037519',
    metacriticScore: '92',
    steamRatingText: 'Overwhelmingly Positive',
    steamRatingPercent: '97',
    steamRatingCount: '87000',
    steamAppID: '504230',
    releaseDate: 1516838400,
    dealRating: '9.7',
    thumb: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/504230/header.jpg'
  },
  {
    dealID: 'fallback-discoelysium',
    title: 'Disco Elysium - The Final Cut',
    storeID: '7',
    gameID: '204211',
    salePrice: '9.99',
    normalPrice: '39.99',
    savings: '75.018755',
    metacriticScore: '97',
    steamRatingText: 'Very Positive',
    steamRatingPercent: '93',
    steamRatingCount: '81000',
    steamAppID: '632470',
    releaseDate: 1571097600,
    dealRating: '9.6',
    thumb: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/632470/header.jpg'
  },
  {
    dealID: 'fallback-freegame1',
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
  }
];

// 1. Stores endpoint
app.get('/api/stores', async (_req, res) => {
  const now = Date.now();
  if (cache.stores && now - cache.stores.timestamp < CACHE_TTL_STORES) {
    return res.json(cache.stores.data);
  }

  try {
    const response = await fetch(`${CHEAPSHARK_BASE}/stores`, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const stores = await response.json();
    cache.stores = { data: stores, timestamp: now };
    return res.json(stores);
  } catch (err) {
    console.warn('CheapShark stores fetch failed, using fallback stores:', err);
    return res.json(FALLBACK_STORES);
  }
});

// 2. Deals endpoint
app.get('/api/deals', async (req, res) => {
  const query = new URLSearchParams(req.query as Record<string, string>).toString();
  const cacheKey = `deals_${query}`;
  const now = Date.now();

  const cached = cache.deals?.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_DEALS) {
    return res.json(cached.data);
  }

  try {
    const url = `${CHEAPSHARK_BASE}/deals?${query}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const deals = await response.json();
    cache.deals?.set(cacheKey, { data: deals, timestamp: now });
    return res.json(deals);
  } catch (err) {
    console.warn('CheapShark deals fetch failed, using fallback deals:', err);
    // Filter fallback deals if title or price query exists
    let filtered = [...FALLBACK_DEALS];
    if (req.query.title) {
      const q = String(req.query.title).toLowerCase();
      filtered = filtered.filter(d => d.title.toLowerCase().includes(q));
    }
    if (req.query.storeID) {
      filtered = filtered.filter(d => d.storeID === req.query.storeID);
    }
    if (req.query.upperPrice) {
      const max = parseFloat(String(req.query.upperPrice));
      filtered = filtered.filter(d => parseFloat(d.salePrice) <= max);
    }
    return res.json(filtered);
  }
});

// 3. Game deal details & comparison endpoint
app.get('/api/deal', async (req, res) => {
  const dealId = req.query.id as string;
  if (!dealId) {
    return res.status(400).json({ error: 'Missing deal id' });
  }

  try {
    const response = await fetch(`${CHEAPSHARK_BASE}/deals?id=${encodeURIComponent(dealId)}`, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const details = await response.json();
    return res.json(details);
  } catch (err) {
    console.warn('CheapShark deal lookup failed:', err);
    return res.status(404).json({ error: 'Deal details currently unavailable' });
  }
});

// 4. Game lookup by title
app.get('/api/games', async (req, res) => {
  const title = req.query.title as string;
  if (!title) {
    return res.status(400).json({ error: 'Missing title query' });
  }

  try {
    const response = await fetch(`${CHEAPSHARK_BASE}/games?title=${encodeURIComponent(title)}`, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const games = await response.json();
    return res.json(games);
  } catch (err) {
    console.warn('CheapShark game search failed:', err);
    return res.json([]);
  }
});

// 5. Native Local Execution endpoint (for standalone executables & OS protocols)
app.post('/api/launch-local', (req, res) => {
  const { executablePath, launchArgs, protocolUri } = req.body;
  const currentPlatform = os.platform(); // 'win32', 'darwin', 'linux'

  if (protocolUri) {
    const cmd = currentPlatform === 'win32'
      ? `start "" "${protocolUri}"`
      : currentPlatform === 'darwin'
      ? `open "${protocolUri}"`
      : `xdg-open "${protocolUri}"`;

    exec(cmd, (error) => {
      if (error) {
        return res.json({ success: false, error: error.message, fallbackRequired: true });
      }
      return res.json({ success: true, method: 'protocol_invoked' });
    });
    return;
  }

  if (executablePath) {
    let cmd = '';
    const args = launchArgs ? ` ${launchArgs}` : '';
    if (currentPlatform === 'win32') {
      cmd = `start "" "${executablePath}"${args}`;
    } else if (currentPlatform === 'darwin') {
      cmd = executablePath.endsWith('.app')
        ? `open -a "${executablePath}" ${launchArgs ? `--args ${launchArgs}` : ''}`
        : `"${executablePath}"${args}`;
    } else {
      cmd = `"${executablePath}"${args}`;
    }

    exec(cmd, (error) => {
      if (error) {
        return res.json({ success: false, error: error.message, fallbackRequired: true });
      }
      return res.json({ success: true, method: 'executable_spawned' });
    });
    return;
  }

  return res.status(400).json({ error: 'Missing executablePath or protocolUri' });
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`OmniLaunch Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
