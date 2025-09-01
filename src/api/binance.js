const BASE = 'https://api.binance.com';

const SYMBOL_MAP = {
    bitcoin: 'BTCUSDT',
    ethereum: 'ETHUSDT',
    solana: 'SOLUSDT',
    cardano: 'ADAUSDT',
    bnb: 'BNBUSDT',
    ripple: 'XRPUSDT',
    dogecoin: 'DOGEUSDT',
    polkadot: 'DOTUSDT',
    litecoin: 'LTCUSDT',
};

export function toBinanceSymbol(idOrSymbol) {
    if (!idOrSymbol) return null;
    const lower = String(idOrSymbol).toLowerCase();
    if (SYMBOL_MAP[lower]) return SYMBOL_MAP[lower];
    const upper = String(idOrSymbol).toUpperCase();
    if (/[A-Z]{3,}USDT$/.test(upper)) return upper;
    return null;
}

const VALID_INTERVALS = new Set([
    '1m', '3m', '5m', '15m', '30m',
    '1h', '2h', '4h', '6h', '8h', '12h',
    '1d', '3d', '1w', '1M'
]);

async function getJSON(url) {
    const res = await fetch(url);
    if (!res.ok) {
        let body = '';
        try { body = await res.text(); } catch { }
        throw new Error(`Binance ${res.status} ${res.statusText} -- ${body || 'unknown error'}`);
    }
    return res.json();
}

export async function getOHLC(idOrSymbol, interval = '1d', limit = 60) {
    let symbol = toBinanceSymbol(idOrSymbol);
    if (!symbol) throw new Error(`Не удалось сопоставить "${idOrSymbol}" с символом Binance (например, BTCUSDT).`);
    if (!VALID_INTERVALS.has(interval)) interval = '1d';

    const url = `${BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const raw = await getJSON(url);
    return raw.map(k => ({
        time: Math.floor(k[0] / 1000),
        open: +k[1],
        high: +k[2],
        low: +k[3],
        close: +k[4],
    }));
}

export async function getLatestPrice(idOrSymbol) {
    const symbol = toBinanceSymbol(idOrSymbol);
    if (!symbol) throw new Error('Bad symbol');
    const url = `${BASE}/api/v3/ticker/price?symbol=${symbol}`;
    const data = await getJSON(url);
    return +data.price;
}

export async function getLatestPriceMany(symbols) {
    const out = {};
    await Promise.all(symbols.map(async s => {
        try {
            const url = `${BASE}/api/v3/ticker/price?symbol=${s}`;
            const data = await getJSON(url);
            out[s] = +data.price;
        } catch { }
    }));
    return out;
}

export async function getLatestKline(idOrSymbol, interval = '1d') {
    const symbol = toBinanceSymbol(idOrSymbol);
    if (!symbol) throw new Error('Bad symbol');
    if (!VALID_INTERVALS.has(interval)) interval = '1d';
    const url = `${BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=2`;
    const raw = await getJSON(url);
    const map = k => ({
        time: Math.floor(k[0] / 1000),
        open: +k[1],
        high: +k[2],
        low: +k[3],
        close: +k[4],
    });
    return raw.map(map);
}