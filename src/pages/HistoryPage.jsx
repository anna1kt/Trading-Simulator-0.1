import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTrades } from '../store/storage';

export default function HistoryPage() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [trades, setTrades] = useState([]);

  useEffect(() => { 
    if (!uid) return; 
    (async () => setTrades(await getTrades(uid)))() 
  }, [uid]);

  if (!uid) return <div className="alert alert-warning">Войдите в аккаунт.</div>;
  if (trades.length === 0) return <div className="alert alert-secondary">История пуста.</div>;

  return (
    <div className="card shadow-sm overflow-auto">
      <div className="card-body">
        <h3 className="mb-3">📈 История сделок</h3>
        <table className="table table-hover align-middle history-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Тип</th>
              <th>Тикер</th>
              <th className="text-end">Количество</th>
              <th className="text-end">Цена / Сумма</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t, i) => (
              <tr key={t.id} className={`fade-in ${t.type}`}>
                <td>{new Date(t.ts).toLocaleString()}</td>
                <td>
                  <span className={`badge ${t.type === 'buy' ? 'bg-success' : t.type === 'sell' ? 'bg-danger' : 'bg-info'}`}>
                    {t.type}
                  </span>
                </td>
                <td>{t.symbol || '-'}</td>
                <td className="text-end">{t.qty ?? '-'}</td>
                <td className="text-end">
                  {t.price ? `$${Number(t.price).toFixed(2)}` : (t.amount ? `+$${t.amount}` : '-')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}