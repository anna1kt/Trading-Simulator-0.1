const logos = {
    BTC: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11" fill="#F7931A"/><path d="M13.5 6.5h-3v1.2h-.9v1h.9v6.6h-.9v1h.9v1.2h3v-1.2h1.1c1.8 0 3.1-1 3.1-2.6 0-1.2-.7-2-1.8-2.3.9-.3 1.5-1 1.5-2.1 0-1.5-1.2-2.4-3-2.4H13.5Zm1.1 5.3c.9 0 1.5.5 1.5 1.3 0 .8-.6 1.3-1.5 1.3H13.5v-2.6h1.1Zm-.2-3.4c.8 0 1.3.4 1.3 1.1 0 .7-.5 1.1-1.3 1.1H13.5V8.4h.9Z" fill="#fff"/></svg>`,
    ETH: `<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><path fill="#627EEA" d="M12 2l7 10-7 4-7-4z"/><path fill="#627EEA" opacity=".7" d="M12 2v14l7-4z"/><path fill="#627EEA" opacity=".5" d="M12 22l7-10-7 4-7-4z"/></svg>`,
    SOL: `<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="4" x="2" y="4" rx="2" fill="#14F195"/><rect width="20" height="4" x="2" y="10" rx="2" fill="#00FFA3" opacity=".7"/><rect width="20" height="4" x="2" y="16" rx="2" fill="#9945FF" opacity=".85"/></svg>`,
    ADA: `<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" fill="#0033AD"/><circle cx="12" cy="12" r="2" fill="#fff"/><circle cx="7" cy="12" r="1" fill="#fff"/><circle cx="17" cy="12" r="1" fill="#fff"/><circle cx="12" cy="7" r="1" fill="#fff"/><circle cx="12" cy="17" r="1" fill="#fff"/></svg>`,
    BNB: `<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><path fill="#F3BA2F" d="M12 2l3.5 3.5L12 9 8.5 5.5 12 2Zm6.5 6.5L22 12l-3.5 3.5L15 12l3.5-3.5ZM12 15l3.5 3.5L12 22l-3.5-3.5L12 15ZM2 12l3.5-3.5L9 12l-3.5 3.5L2 12Zm7-3l3 3-3 3-3-3 3-3Z"/></svg>`,
    XRP: `<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><path fill="#23292F" d="M6 7c2.2 2.2 5.8 2.2 8 0l1.6-1.6h2.8L16 7c-3 3-8 3-11 0L3.6 5.4h2.8L6 7Zm12 10c-2.2-2.2-5.8-2.2-8 0L8.4 18.6H5.6L8 17c3-3 8-3 11 0l1.4 1.6h-2.8L18 17Z"/></svg>`,
    DOGE: `<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#C2A633"/><path fill="#fff" d="M7 6h6.2c2.9 0 4.8 2 4.8 5s-1.9 5-4.8 5H7V6Zm3 2.2v7.6h3.2c1.9 0 3.1-1.6 3.1-3.8s-1.2-3.8-3.1-3.8H10Z"/></svg>`,
    DOT: `<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" fill="#E6007A"/><circle cx="12" cy="5" r="1.2" fill="#fff"/><circle cx="12" cy="19" r="1.2" fill="#fff"/><circle cx="5" cy="12" r="1.2" fill="#fff"/><circle cx="19" cy="12" r="1.2" fill="#fff"/></svg>`,
    LTC: `<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#345D9D"/><path fill="#fff" d="M11 6h2l-1 4h3l-.4 2h-3l-.6 2.5h5l-.4 2H7.5l1.4-5.5H8l.4-2h1.2L11 6Z"/></svg>`,
};

export const assetsMeta = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', logoSvg: logos.BTC },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', logoSvg: logos.ETH },
    { id: 'solana', symbol: 'SOL', name: 'Solana', logoSvg: logos.SOL },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', logoSvg: logos.ADA },
    { id: 'bnb', symbol: 'BNB', name: 'BNB', logoSvg: logos.BNB },
    { id: 'ripple', symbol: 'XRP', name: 'Ripple', logoSvg: logos.XRP },
    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', logoSvg: logos.DOGE },
    { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', logoSvg: logos.DOT },
    { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', logoSvg: logos.LTC },
];

export const initialAssets = assetsMeta.map(a => ({
    id: a.id,
    symbol: a.symbol,
    name: a.name,
    logoSvg: a.logoSvg,
    history: seedHistory(seedPrice(a.symbol)),
}));

function seedPrice(symbol) {
    switch (symbol) {
        case 'BTC': return 45000;
        case 'ETH': return 3000;
        case 'SOL': return 150;
        case 'ADA': return 0.45;
        case 'BNB': return 600;
        case 'XRP': return 0.6;
        case 'DOGE': return 0.12;
        case 'DOT': return 7;
        case 'LTC': return 75;
        default: return 100;
    }
}

export function seedHistory(start) {
    const points = [];
    let v = start;
    for (let i = 0; i < 30; i++) {
        v = vary(v, 0.04);
        points.push(Number(v.toFixed(2)));
    }
    return points;
}
export function vary(value, pct = 0.05) {
    const delta = value * pct * (Math.random() * 2 - 1);
    return value + delta;
}