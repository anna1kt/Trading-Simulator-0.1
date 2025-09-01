import React from 'react';
import { Link } from 'react-router-dom';

export default function AssetCard({ asset, currentPrice, prevPrice }) {
    const last = currentPrice ?? asset.history?.at(-1) ?? 0;
    const prev = prevPrice ?? asset.history?.at(-2) ?? last;
    const change = last - prev;
    const changePct = prev ? ((change / prev) * 100).toFixed(2) : 0;

    return (
        <div className="card h-100 shadow-sm asset-card">
            <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-center gap-2">
                        <div className="logo-badge-svg" dangerouslySetInnerHTML={{ __html: asset.logoSvg }} />
                        <div>
                            <h5 className="card-title mb-1">{asset.name}</h5>
                            <p className="text-secondary mb-2">{asset.symbol}</p>
                        </div>
                    </div>
                    <span className={`badge ${change >= 0 ? 'bg-success' : 'bg-danger'}`}>
                        {change >= 0 ? '▲' : '▼'} {changePct}%
                    </span>
                </div>

                <div className="mt-auto">
                    <div className="d-flex align-items-baseline gap-2">
                        <span className="h4 mb-0">${Number(last).toFixed(2)}</span>
                        <Link to={`/asset/${asset.id}`} className="btn btn-sm btn-outline-secondary ms-auto">Trade</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}