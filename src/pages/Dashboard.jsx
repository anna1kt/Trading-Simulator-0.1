import React, { useEffect, useState, useMemo } from 'react';
import AssetCard from './AssetCard';
import { initialAssets } from '../data/assets';
import { useAuth } from '../hooks/useAuth';
import { ensureUserDoc, listenUserDoc, airdropIfDue } from '../store/storage';
import Modal from './Modal';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { binanceSymbols } from '../data/binanceSymbols';

export default function Dashboard() {
    const assets = initialAssets;
    const { user } = useAuth(); 
    const [balance, setBalance] = useState(0);
    const [showAirdropModal, setShowAirdropModal] = useState(null);
    const [prices, setPrices] = useState({});
    const [prevPrices, setPrevPrices] = useState({});
    const [leaders, setLeaders] = useState([]);

    const symbols = useMemo(() => assets.map(a => binanceSymbols[a.id]).filter(Boolean), [assets]);

    useEffect(() => {
        if (!user) return;

        let unsubUser = () => {};

        (async () => {
            await ensureUserDoc(user.uid);

            unsubUser = listenUserDoc(user.uid, (data) => {
                if (data?.balance != null) setBalance(data.balance);
            });

            const res = await airdropIfDue(user.uid);
            if (res?.amount) setShowAirdropModal({ amount: res.amount });
        })();

        return () => unsubUser();
    }, [user?.uid]);

    useEffect(() => {
        if (!symbols.length) return;
        const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${symbols.map(s => s.toLowerCase() + '@trade').join('/')}`);
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            const { s: symbol, p: price } = msg.data;
            setPrices(prev => {
                setPrevPrices(p => ({ ...p, [symbol]: prev[symbol] || parseFloat(price) }));
                return { ...prev, [symbol]: parseFloat(price) };
            });
        };
        return () => ws.close();
    }, [symbols]);

    useEffect(() => {
        const q = query(collection(db, "users"), orderBy("balance", "desc"), limit(10));
        const unsub = onSnapshot(q, (snap) => {
            const arr = [];
            snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
            setLeaders(arr);
        });
        return () => unsub();
    }, []);

    const priceOf = (asset) => prices[binanceSymbols[asset.id]];
    const prevOf = (asset) => prevPrices[binanceSymbols[asset.id]];

    return (
        <div className="container py-4">
            {/* Заголовок и баланс */}
            <div className="card mb-3 p-3 d-flex flex-column flex-md-row align-items-center justify-content-between shadow-sm">
                <div className="d-flex align-items-center gap-3">
                    <div className="brand-logo">💹</div>
                    <div>
                        <h1 className="display-5 mb-1 fw-bold">Trading Simulator 0.1</h1>
                        <p className="text-secondary mb-0">Испытай себя в трейдинге и стань лидером!</p>
                    </div>
                </div>
                <div className="text-end">
                    <div className="small text-secondary">Баланс</div>
                    <div className="h3">${Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
            </div>

            {/* Карточки активов */}
            <div className="row g-3">
                {assets.map(a => (
                    <div key={a.id} className="col-12 col-sm-6 col-lg-4">
                        <AssetCard asset={a} currentPrice={priceOf(a)} prevPrice={prevOf(a)} />
                    </div>
                ))}
            </div>

            {/* Лидерборд */}
            <div className="card mt-4 p-3">
                <h5 className="mb-3">🏆 Лидерборд</h5>
                <div className="table-responsive">
                    <table className="table table-striped table-hover align-middle mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Игрок</th>
                                <th>Баланс</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaders.map((u, i) => (
                                <tr key={u.id}>
                                    <td>{i + 1}</td>
                                    <td className="d-flex align-items-center gap-2">
                                        {u.avatarUrl ? (
                                            <img src={u.avatarUrl} alt="" className="rounded-circle border" style={{ width: "32px", height: "32px", objectFit: "cover" }} />
                                        ) : (
                                            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white" style={{ width: "32px", height: "32px" }}>👤</div>
                                        )}
                                        <span>{u.nickname || "Без имени"}</span>
                                    </td>
                                    <td className="fw-semibold">${u.balance?.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* About */}
            <div className="card mt-4 p-3">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-1">About</h5>
                    <Link className="btn btn-primary" to="/about">Открыть страницу</Link>
                </div>
            </div>

            {/* Аирдроп модалка */}
            {showAirdropModal && (
                <Modal
                    title="Начисление средств"
                    onClose={() => setShowAirdropModal(null)}
                    okText="Ок"
                    onOk={() => setShowAirdropModal(null)}
                >
                    На ваш баланс зачислено +${showAirdropModal.amount}. Успешного трейдинга!
                </Modal>
            )}
        </div>
    );
}





