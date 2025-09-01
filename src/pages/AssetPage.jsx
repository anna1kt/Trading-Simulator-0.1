import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import PriceChart from "./PriceChart";
import { getOHLC, getLatestKline } from "../api/binance";
import { initialAssets } from "../data/assets";
import TradeForm from "./TradeForm";
import { useAuth } from "../hooks/useAuth";
import { buyAsset, sellAsset } from "../store/storage";
import Modal from "./Modal";
import { binanceSymbols } from '../data/binanceSymbols';

export default function AssetPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const asset = useMemo(() => initialAssets.find((a) => a.id === id) || initialAssets[0], [id]);

    const [interval, setInterval] = useState("1m");
    const [limit, setLimit] = useState(200);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lastPrice, setLastPrice] = useState(0);
    const [dealModal, setDealModal] = useState(null);
    const [errorModal, setErrorModal] = useState(null);

    const chartRef = useRef(null);
    const symbol = binanceSymbols[asset.id];

    useEffect(() => {
        let alive = true;
        async function load() {
            try {
                setLoading(true); setError("");
                if (!symbol) throw new Error("Нет Binance-символа для " + asset.id);
                const candles = await getOHLC(symbol, interval, limit);
                if (!alive) return;
                setLastPrice(candles[candles.length - 1]?.close ?? 0);
                chartRef.current?.setDataOnce?.(candles);
            } catch (e) {
                if (!alive) return;
                setError(e?.message || "Ошибка загрузки");
            } finally {
                if (alive) setLoading(false);
            }
        }
        load();
        return () => { alive = false; };
    }, [asset.id, symbol, interval, limit]);

    useEffect(() => {
        if (!symbol) return;
        let timer = null, cancelled = false;
        const tick = async () => {
            try {
                const kl = await getLatestKline(symbol, interval);
                const last = kl?.[1];
                if (!last || cancelled) return;
                setLastPrice(last.close);
                chartRef.current?.append?.({ time: last.time, open: last.open, high: last.high, low: last.low, close: last.close });
            } catch { }
            finally {
                if (!cancelled) timer = setTimeout(tick, 3000);
            }
        };
        tick();
        return () => { cancelled = true; if (timer) clearTimeout(timer); };
    }, [symbol, interval]);


    const handleTrade = async (type, qty) => {
        try {
            if (!user) throw new Error("Требуется вход.");
            if (!lastPrice || qty <= 0) throw new Error("Некорректные данные сделки.");
            if (type === "buy") {
                await buyAsset(user.uid, symbol, qty, lastPrice);
                setDealModal({ type: 'buy', symbol, qty, price: lastPrice });
            } else {
                await sellAsset(user.uid, symbol, qty, lastPrice);
                setDealModal({ type: 'sell', symbol, qty, price: lastPrice });
            }
        } catch (e) {
            setErrorModal(e.message || 'Ошибка сделки');
        }
    };

    return (
        <div className="app-max">
            <div className="card p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <div className="logo-badge-svg" dangerouslySetInnerHTML={{ __html: asset.logoSvg }} />
                        <div>
                            <h3 className="mb-1">{asset.name} ({asset.symbol})</h3>
                            <div className="h4 mb-0">${Number(lastPrice || asset.history.at(-1)).toFixed(4)}</div>
                            <div className="text-secondary small">Обновление каждые 3 сек</div>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <select className="form-select" value={interval} onChange={(e) => setInterval(e.target.value)}>
                            <option value="1m">1m</option><option value="3m">3m</option><option value="5m">5m</option>
                            <option value="15m">15m</option><option value="1h">1h</option><option value="4h">4h</option><option value="1d">1d</option>
                        </select>
                        <select className="form-select" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                            <option value={100}>100</option><option value={200}>200</option><option value={500}>500</option>
                        </select>
                    </div>
                </div>
            </div>


            <div className="card p-3 mb-3">
                {loading && <p className="text-secondary">Загрузка графика…</p>}
                {error && <p className="text-danger">Ошибка: {error}</p>}
                <PriceChart ref={chartRef} data={[]} interval={interval} />
            </div>

            <div className="card p-3 mb-3">
                <h5 className="mb-3">Совершить сделку</h5>
                <TradeForm price={lastPrice} onTrade={handleTrade} />
            </div>

            {dealModal && (
                <Modal title="Сделка выполнена" onClose={() => setDealModal(null)} okText="Отлично" onOk={() => setDealModal(null)}>
                    {dealModal.type === 'buy' ? 'Куплено' : 'Продано'} {dealModal.qty} {dealModal.symbol} по цене ${Number(dealModal.price).toFixed(4)}.
                </Modal>
            )}
            {errorModal && (
                <Modal title="Ошибка" onClose={() => setErrorModal(null)} okText="Понятно" onOk={() => setErrorModal(null)}>
                    {errorModal}
                </Modal>
            )}
        </div>
    );
}